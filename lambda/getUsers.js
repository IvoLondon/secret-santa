const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // UPDATE THE DB
  try {
    // const tablePut = await dynamo
    //   .query({
    //     TableName: "formStore",
    //     ExpressionAttributeValues: {
    //       ":email": {
    //         S: "No One You Know",
    //       },
    //     },
    //     KeyConditionExpression: "email = :email",
    //     ProjectionExpression: "name",
    //   })
    //   .promise();
    // console.log("Updating Done ", tablePut);
    return {
      statusCode: 200,
      body: {},
    };
  } catch (e) {
    console.log("Error with fetch users: ", e);

    return {
      statusCode: 500,
    };
  }
};
