const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // UPDATE THE DB
  try {
    const tablePut = await dynamo
      .scan({
        TableName: "formStore",
        // Specify which items in the results are returned.
        FilterExpression: "#name <> :name",
        // Define the expression attribute value, which are substitutes for the values you want to compare.
        ExpressionAttributeNames: {
          "#name": "name",
          "#attending": "attending",
        },
        ExpressionAttributeValues: {
          ":name": "",
        },
        ProjectionExpression: "#name, #attending",
      })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: tablePut.Items,
        errorMessage: null,
      }),
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
