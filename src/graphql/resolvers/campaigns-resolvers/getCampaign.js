/*
Description: Get a campaign
Parameters:
  request: SingleCampaignQueryRequest!
*/

import { makeError } from "../../../utils/index.js";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getCampaign = async (request, { lambdaContext }) => {
  try {
    const { id, handler } = request;
    const { dynamoDB } = lambdaContext;

    if (!id || !handler) {
      return makeError("InvalidParameters");
    }

    // Get the campaign from the database
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "pk = :pk and sk = :sk",
      ExpressionAttributeValues: {
        ":pk": `profile#${handler}`,
        ":sk": `campaign#${id}`,
      },
    };

    const command = new QueryCommand(params);
    const data = await dynamoDB.send(command);

    const campaign = data?.Items?.[0];

    campaign.location = JSON.parse(campaign.location);
    campaign.profile = campaign.profile ? JSON.parse(campaign.profile) : null;

    if (!campaign) {
      return makeError("CampaignDoesNotExist");
    }

    if (campaign.status !== "active") {
      return makeError("CampaignIsNotAvailable");
    }

    // lastParticipents is a array of JSON strings that need to be parsed
    campaign.latestParticipants = campaign.latestParticipants
      ? campaign.latestParticipants.map((participant) => {
          return JSON.parse(participant);
        })
      : [];

    return {
      campaign,
    };
  } catch (error) {
    console.error(error);
    return makeError("InternalServerError");
  }
};
