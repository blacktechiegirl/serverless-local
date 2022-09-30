const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { uuid } = require('uuidv4');

// const dynamo = new DynamoDBClient({});

const dynamo = new DynamoDBClient({
  region: "us-east-1",
  accessKeyId: "access-key-id",
  secretAccessKeyId: "secret_access_key_id",
  endpoint: "http://localhost:8000"
});

const createComment = async (event) => {
  const response = { 
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
    },
 };

  try {
    const requestJSON = JSON.parse(event.body);
    const data= {
        postId: requestJSON.postid,
        commentId: uuid(),
        userId: requestJSON.userid,
        userName: requestJSON.username,
        comment: requestJSON.comment,
        date: new Date().getTime(),
    }
    const params = {
      TableName: process.env.DYNAMODB_COMMENT_TABLE,
      Item: marshall(data),
    };
    const createResult = await dynamo.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created comment.",
      data,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create comment.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = { createComment };
