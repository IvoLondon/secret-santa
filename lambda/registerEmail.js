const crypto = require("crypto");
const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");

const dynamo = new AWS.DynamoDB.DocumentClient();

sgMail.setApiKey(process.env.SENDGRID_API);

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  if (body) {
    // ERROR IF EMAIL MISSING
    if (!body.email) {
      console.error("No email provided");
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({ data: null, errorMessage: "No email provided" }),
      };
    }

    // ERROR IF EMAIL IS NOT VALID
    const validEmail = body.email.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    );
    const emailMatch = body.email.match(/.*@(\S+)/);
    if (!validEmail || !emailMatch || emailMatch[1] !== "vodafone.com") {
      console.error("Email is not vodafone");
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({
          data: null,
          errorMessage: ["Please use your work vodafone.com email"],
        }),
      };
    }

    // CREATE THE TOKEN
    const token = crypto.randomBytes(6).toString("base64");
    const tokenExp = new Date().getTime() + 360000000; // 1 hour

    // UPDATE THE DB
    try {
      const tablePut = await dynamo
        .update({
          TableName: "formStore",
          Key: {
            email: body.email,
          },
          UpdateExpression: "set #token = :x, #tokenExp = :y",
          ExpressionAttributeNames: {
            "#token": "token",
            "#tokenExp": "tokenExp",
          },
          ExpressionAttributeValues: {
            ":x": token,
            ":y": tokenExp,
          },
        })
        .promise();
      console.log("Updating Done ", tablePut);
    } catch (e) {
      console.log(e);
    }

    // SEND EMAIL
    const msg = {
      to: body.email,
      from: "noreply@em8548.ivelin.me", // Use the email address or domain you verified above
      subject: "Secret santa", // fix subject
      template_id: "d-ced47cb4d61946a780be644c7657f8ef",
      dynamic_template_data: {
        registration_url: `https://secret-santa-blush.vercel.app?token=${token}&email=${body.email}`,
      },
    };

    try {
      const res = await sgMail.send(msg);
    } catch (error) {
      console.error(error);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({
          data: null,
          errorMessage: ["Santa got stuck up the chimney"],
        }),
      };
    }

    // Successfull response
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: JSON.stringify({
        data: [
          "You are almost on the good list -",
          "Please check your inbox and verify your email.",
          "P.S. The elves are very busy, they should send you the email in the next 5-10 mins.",
        ],
        errorMessage: null,
      }),
    };
    return response;
  }
  // DEFAULT RES
  const response = {
    statusCode: 404,
    headers: {
      "Content-Type": "text/html",
    },
    body: JSON.stringify({ data: body, errorMessage: "Data not found!" }),
  };
  return response;
};
