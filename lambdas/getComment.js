const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const db = new DynamoDBClient({});
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({
  region: "us-east-1",
  accessKeyId: "access-key-id",
  secretAccessKeyId: "secret_access_key_id",
  endpoint: "http://localhost:8000",
});

function sortByDate(a, b) {
  if (a.date > b.date) {
    return -1;
  } else return 1;
}

const getComment = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
  };
  const params = {
    TableName: process.env.DYNAMODB_COMMENT_TABLE,
    KeyConditionExpression: "postId = :postId",
    ExpressionAttributeValues: marshall({
      ":postId": event.pathParameters.postId,
    }),
  };

  try {
    let data;
    const { Items } = await db.send(new QueryCommand(params));
    data = Items.map((item) => unmarshall(item));
    data = data.sort(sortByDate);
    response.body = JSON.stringify({
      status: "success",
      result: data.length,
      data,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve comments.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = { getComment };
