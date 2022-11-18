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
          "#attending": "attending",
        },
        ExpressionAttributeValues: {
          ":name": "",
        },
        ProjectionExpression: "#name, #attending, address, wishes, email",
      })
      .promise();

    // shuffles users and returns a set of pairs
    const users = matcher(tableData.Items);

    // Prepare messages in array
    const messagesList = [];
    users.forEach((user) => {
      const sender = user[0];
      const receiver = user[1];
      let exchange_method = "";
      // exchange method
      if (sender.attending) {
        if (receiver.attending) {
          exchange_method =
            "Bring your gift in the office and wait for further instructions on the exchange.";
        } else {
          exchange_method = `Please send your gift to the following address: \n ${receiver.address}`;
        }
      } else {
        if (receiver.attending) {
          exchange_method =
            "One of Santa's elfs will take your gift to the office for you. Please send your gift to the following recipient: \n Ivelin Iliev, 1b Lynn Street, Enfield, EN20JY. Please drop me a message in slack to let me know what I should expect.";
        } else {
          exchange_method = `Please send your gift to the following address: \n ${receiver.address}`;
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
          location: receiver.name ? "the office" : "home",
          wishes: receiver.wishes
            ? `Here are some ideas from ${receiver.name}'s wish list: \n ${receiver.wishes}`
            : "The giftee hasn't shared their wishlist. It's up to you what colour socks you pick!",
          exchange_method: exchange_method,
        },
      };
      messagesList.push(msg);
    });

    // SEND THE EMAILS
    try {
      console.log("SEND THE EMAILS", messagesList);
    } catch (e) {
      console.error("Sending email error ", e);
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.log("Error with fetch users: ", e);

    return {
      statusCode: 500,
      body: JSON.stringify({
        data: null,
        errorMessage: ["Could not fetch users"],
      }),
    };
  }
};
