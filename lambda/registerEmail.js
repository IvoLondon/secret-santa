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
        .put({
          TableName: "formStore",
          Item: {
            email: body.email,
            token: token,
            tokenExp: tokenExp,
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
        registration_url: `https://secret-santa-b4pct2967-ivolondon.vercel.app?token=${token}&email=${body.email}`,
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
          "You are almost added to the good list.",
          "Please check your inbox and verify your email.",
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
