const fs = require("fs");
const crypto = require("crypto");
const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");

const dynamo = new AWS.DynamoDB.DocumentClient();

sgMail.setApiKey(process.env.SENDGRID_API);

/**
 * Returns an HTML page containing an interactive Web-based
 * tutorial. Visit the function URL to see it and learn how
 * to build with lambda.
 */
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
        body: { data: null, errorMessage: "No email provided" },
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
        body: dynamicForm(html, "Please use your work vodafone.com email"),
      };
    }

    // IF TOKEN NOT PROVIDED
    let token = body?.token;
    const email = emailMatch[0];
    if (!token) {
      // CREATE THE TOKEN
      token = crypto.randomBytes(6).toString("base64");
      const tokenExp = new Date().getTime() + 360000000; // 1 hour

      // UPDATE THE DB
      try {
        const tablePut = await dynamo
          .put({
            TableName: "formStore",
            Item: {
              email: email,
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
        to: email,
        from: "noreply@em8548.ivelin.me", // Use the email address or domain you verified above
        subject: "Secret santa", // fix subject
        template_id: "d-ced47cb4d61946a780be644c7657f8ef",
        dynamic_template_data: {
          registration_url: `https://dwyi6ye4g433mzwi3zc66keobe0jcbce.lambda-url.eu-west-2.on.aws?token=${token}&email=${email}`,
        },
      };

      try {
        const res = await sgMail.send(msg);
        console.log(res);
      } catch (error) {
        console.error(error);
      }

      // Successfull response
      const response = {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: dynamicForm(
          html,
          "A verification email has been send to your inbox."
        ),
      };
      return response;
    }

    // IF TOKEN IS PROVIDED
    try {
      // check if user exists
      const user = await dynamo
        .get({
          TableName: "formStore",
          Key: {
            email: email,
          },
        })
        .promise();
      // USER DOES NOT EXIST
      console.log("USER IS", user);
      console.log("USER IS", email);
      console.log("TOKEN IS", token);
      console.log("HAS PROPS", Object.keys(user).length);
      if (!Object.keys(user).length) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "text/html",
          },
          body: dynamicForm(
            html,
            "Email address does not exist, please register first."
          ),
        };
      }

      const oldToken = user.Item.token;
      const oldTokenExp = user.Item.tokenExp;
      // TOKEN DOES NOT MATCH
      if (oldToken !== token) {
        return {
          statusCode: 401,
          headers: {
            "Content-Type": "text/html",
          },
          body: dynamicForm(html, "Token is not valid, please register again."),
        };
      }

      // TOKEN HAS EXPIRED
      if (oldTokenExp < new Date().getTime()) {
        return {
          statusCode: 401,
          headers: {
            "Content-Type": "text/html",
          },
          body: dynamicForm(html, "Token has expired, please register again."),
        };
      }
    } catch (e) {
      console.error("Error with token: ", e);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: dynamicForm(html, "Error with finding user."),
      };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: dynamicForm(registrationPage, null),
    };
  }

  // DEFAULT RES
  const response = {
    statusCode: 404,
    headers: {
      "Content-Type": "text/html",
    },
    body: { data: body, errorMessage: "Data not found!" },
  };
  return response;
};
