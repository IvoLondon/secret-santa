const AWS = require("aws-sdk");
const matcher = require("secret-santa-matcher");
const sgMail = require("@sendgrid/mail");

const dynamo = new AWS.DynamoDB.DocumentClient();
sgMail.setApiKey(process.env.SENDGRID_API);

exports.handler = async (event) => {
  // UPDATE THE DB
  try {
    const tableData = await dynamo
      .scan({
        TableName: "testFormstore",
        // Specify which items in the results are returned.
        FilterExpression: "#name <> :name and attribute_exists(#name)",
        // Define the expression attribute value, which are substitutes for the values you want to compare.
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": "",
        },
        ProjectionExpression: "#name, attending, address, wishes, email",
      })
      .promise();

    // split users in groups - office and home participants
    const officeUsers = [];
    const homeUsers = [];

    tableData.Items.forEach((user) => {
      if (user.attending) {
        officeUsers.push(user);
      } else {
        homeUsers.push(user);
      }
      return user;
    });

    console.log("========= List of officeUsers ", officeUsers);
    console.log("========= List of homeUsers ", homeUsers);

    // shuffles users and returns a set of pairs
    const officeUsersMatched = matcher(officeUsers);
    const homeUsersMatched = matcher(homeUsers);

    // Prepare messages in array
    const handleMessage = (userPairs) => {
      console.log("========= User pairs ", userPairs);
      const messagesList = [];
      userPairs.forEach((users) => {
        const sender = users[0];
        const receiver = users[1];
        let exchange_method = "";
        // exchange method
        if (sender.attending) {
          if (receiver.attending) {
            exchange_method =
              "Bring your gift in the office and wait for further instructions on the exchange.";
          } else {
            exchange_method = `Please send your gift to the following address: <br /> ${receiver.address.replace(
              /\n/g,
              "<br />"
            )}`;
          }
        } else {
          if (receiver.attending) {
            exchange_method =
              "One of Santa's elfs will take your gift to the office for you. Please send your gift to the following recipient: <br /> Ivelin Iliev, 1b Lynn Street, Enfield, EN20JY.<br />Please drop me a message in slack to let me know what I should expect.";
          } else {
            exchange_method = `Please send your gift to the following address: <br /> ${receiver.address.replace(
              /\n/g,
              "<br />"
            )}`;
          }
        }
        // SEND EMAIL
        const msg = {
          to: sender.email,
          from: "noreply@em8548.ivelin.me", // Use the email address or domain you verified above
          template_id: "d-3ccb7d8d5da24b11b51e2b29119a0d11",
          dynamic_template_data: {
            sender_name: sender.name,
            receiver_name: receiver.name,
            location: receiver.attending ? "the office" : "home",
            wishes: receiver.wishes
              ? `Here are some ideas from ${
                  receiver.name
                }'s wish list: <br /> ${receiver.wishes.replace(
                  /\n/g,
                  "<br />"
                )}`
              : "The giftee hasn't shared their wishlist. It's up to you what colour socks you pick!",
            exchange_method: exchange_method,
          },
        };
        messagesList.push(msg);
      });
      return messagesList;
    };

    // shuffles users and returns a set of pairs
    const messagesList = handleMessage([
      ...officeUsersMatched,
      ...homeUsersMatched,
    ]);

    // SEND THE EMAILS
    try {
      console.log("========= SEND THE EMAILS", messagesList);
      await Promise.all(
        messagesList.map((msg) => {
          console.log("========= ABOUT TO SEND ", msg);
          return new Promise((resolve) => resolve("Done"));
          // return sgMail.send(msg);
        })
      );
      return {
        statusCode: 200,
      };
    } catch (e) {
      console.error("Sending email error ", e);
      return {
        statusCode: 500,
      };
    }
  } catch (e) {
    console.log("========= Error with fetch users: ", e);

    return {
      statusCode: 500,
      body: JSON.stringify({
        data: null,
        errorMessage: ["Could not fetch users"],
      }),
    };
  }
};
