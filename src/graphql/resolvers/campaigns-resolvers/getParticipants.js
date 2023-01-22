/*
Description: Get participants of a campaign
Parameters:
  request: CampaignParticipantsQueryRequest!
*/

import {
  makeError,
  encodeNextToken,
  decodeNextToken,
} from "../../../utils/index.js";
import { limits } from "../../../config/index.js";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getParticipants = async (request, { lambdaContext }) => {
  try {
    const { campaignId, limit, nextToken } = request;
    const { dynamoDB } = lambdaContext;

    if (!campaignId) {
      return makeError("InvalidParameters");
    }

    // Check if limit is too large
    if (limit > limits.MAX_PARTICIPANTS_PER_PAGE)
      return makeError("LimitTooLarge");

    // Decode the nextToken if it exists and convert it to an object
    // that can be used in the DynamoDB query
    const decodedNextToken = decodeNextToken(nextToken);

    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      IndexName: "gsi3",
      KeyConditionExpression: "gsi3pk = :gsi3pk",
      ExpressionAttributeValues: {
        ":gsi3pk": `CAMPAIGN_PARTICIPANTS#${campaignId}`,
      },
      Limit: limit,
    };

    // If there is a nextToken, add it to the query
    // so that the query can continue where it left off
    // from the previous query
    if (decodedNextToken) {
      params.ExclusiveStartKey = decodedNextToken;
    }

    const command = new QueryCommand(params);
    const data = await dynamoDB.send(command);

    // items[index].profile and items[index].campaign and items[index].recipient are JSON strings that need to be parsed
    data.Items.forEach((item) => {
      item.profile = JSON.parse(item.profile);
      item.campaign = JSON.parse(item.campaign);
      item.recipient = JSON.parse(item.recipient);
    });

    // Encode the nextToken so that it can be sent to the client
    // and used in the next query
    const nextTokenEncoded = encodeNextToken(data.LastEvaluatedKey);

    return {
      items: data.Items,
      nextToken: nextTokenEncoded,
    };
  } catch (error) {
    console.error(error);
    return makeError("InternalServerError");
  }
};
