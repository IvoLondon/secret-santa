const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  if (body) {
    // ERROR IF EMAIL MISSING
    if (!body.email) {
      console.error("No email provided");
      return {
        statusCode: 400,
        body: JSON.stringify({ data: null, errorMessage: "No email provided" }),
      };
    }

    if (!body.token) {
      console.error("No token provided");
      return {
        statusCode: 400,
        body: JSON.stringify({
          data: null,
          errorMessage: "No token provided",
        }),
      };
    }

    if (!body.name) {
      console.error("No name provided");
      return {
        statusCode: 400,
        body: JSON.stringify({
          data: null,
          errorMessage: "No name provided",
        }),
      };
    }

    // IF TOKEN IS PROVIDED
    let user;
    try {
      await dynamo
        .put({
          TableName: "formStore",
          Item: {
            email: body.email,
            token: body.token,
            name: body.name,
            wishes: body.wishes,
            attending: body.attending,
            address: body.attending ? "" : body.address,
            tokenExp: new Date().getTime() + 360000000, // 1 hour,
          },
          Expected: {
            email: {
              Value: body.email,
            },
            token: {
              Value: body.token,
            },
          },
        })
        .promise();
    } catch (e) {
      console.error("Error with updating user: ", e);
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "text/html",
        },
        body: JSON.stringify({
          data: null,
          errorMessage: "Error with updating user.",
        }),
      };
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: JSON.stringify({
        data: [
          "Your profile has been updated.",
          "The elves will send you an email with your giftee's name as soon as everyone else has finished signing up.",
          "Keen an eye on your inbox!",
        ],
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
