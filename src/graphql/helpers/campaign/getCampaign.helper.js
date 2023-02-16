import { GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getCampaign = async (dynamoDB, handler, campaignId) => {
  // Check if the campaign already exists in the database
  const paramsGet = {
    TableName: DYNAMODB_TABLE_NAME,
    Key: {
      pk: `profile#${handler}`,
      sk: `campaign#${campaignId}`,
    },
  };

  // Get the campaign from the database
  const command = new GetCommand(paramsGet);
  return dynamoDB.send(command);
};
