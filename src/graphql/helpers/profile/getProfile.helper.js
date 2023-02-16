import { GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getProfile = async (dynamoDB, handler) => {
  const params = {
    TableName: DYNAMODB_TABLE_NAME,
    Key: {
      pk: `profile#${handler}`,
      sk: `profile#${handler}`,
    },
  };

  const command = new GetCommand(params);
  return dynamoDB.send(command);
};
