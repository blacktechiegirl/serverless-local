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

const createPost = async (event) => {
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
    const data = {
      postId: uuid(),
      userId: requestJSON.userid,
      userName: requestJSON.username,
      date: new Date().getTime(),
      content: requestJSON.content,
      comments: 0,
    };
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(data),
    };
    const createResult = await dynamo.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created post.",
      data
    });
  } catch (e) {
    
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create post.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = { createPost };
