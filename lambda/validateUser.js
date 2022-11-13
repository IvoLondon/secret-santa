const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

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

    if (!body.email) {
      console.error("No token provided");
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({ data: null, errorMessage: "No token provided" }),
      };
    }

    // IF TOKEN IS PROVIDED
    let user;
    try {
      // check if user exists
      user = await dynamo
        .get({
          TableName: "formStore",
          Key: {
            email: body.email,
          },
        })
        .promise();
      // USER DOES NOT EXIST
      if (!Object.keys(user).length) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "text/html",
          },
          body: JSON.stringify({
            data: null,
            errorMessage:
              "Email address does not exist, please register first.",
          }),
        };
      }

      const oldToken = user.Item.token;
      const oldTokenExp = user.Item.tokenExp;
      // TOKEN DOES NOT MATCH
      if (oldToken !== body.token) {
        return {
          statusCode: 401,
          headers: {
            "Content-Type": "text/html",
          },
          body: JSON.stringify({
            data: null,
            errorMessage: "Token is not valid, please register again.",
          }),
        };
      }

      // TOKEN HAS EXPIRED
      if (oldTokenExp < new Date().getTime()) {
        return {
          statusCode: 401,
          headers: {
            "Content-Type": "text/html",
          },
          body: JSON.stringify({
            data: null,
            errorMessage: "Token has expired, please register again.",
          }),
        };
      }
    } catch (e) {
      console.error("Error with token: ", e);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({
          data: null,
          errorMessage: "Error with finding user.",
        }),
      };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: JSON.stringify({
        data: user.Item,
        errorMessage: null,
      }),
    };
  }

  // DEFAULT RES
  const response = {
    statusCode: 500,
    headers: {
      "Content-Type": "text/html",
    },
    body: JSON.stringify({ data: null, errorMessage: "Data not found!" }),
  };
  return response;
};
