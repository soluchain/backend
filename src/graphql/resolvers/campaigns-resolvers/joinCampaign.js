/*
Description: 
  Join a campaign
Notice: 
  Before running this mutation, user needs to run the smart contract function "joinCampaign" to join a campaign
Parameters:
  request: JoinCampaignInput!
*/

import { makeError } from "../../../utils/index.js";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { enums } from "../../../config/index.js";
import { getCampaign, getProfile } from "../../helpers/index.js";

dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const joinCampaign = async (request, { lambdaContext }) => {
  try {
    const { campaignId, handler, participantHandler } = request;
    const { campaignContract, dynamoDB } = lambdaContext;

    // Check if the campaign exists
    const campaignGet = await getCampaign(dynamoDB, handler, campaignId);
    if (!campaignGet.Item) {
      return makeError("CampaignDoesNotExist");
    }

    // Check if the user has already joined the campaign
    let alreadyJoinedInContract = false;
    try {
      alreadyJoinedInContract = await campaignContract.isCampaignFollowed(
        campaignId,
        participantHandler
      );
    } catch (error) {
      return makeError("CampaignDoesNotExist");
    }
    if (!alreadyJoinedInContract) {
      return makeError("NotJoinedCampaignInProfileContract");
    }

    // Get the profile of the participant
    const participantGet = await getProfile(dynamoDB, participantHandler);
    const participantData = participantGet.Item;
    if (!participantData) {
      return makeError("ProfileDoesNotExist");
    }

    // Insert the follow data into the database if the doc does not exist
    const createdAt = Date.now().toString();
    const paramsPut = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        pk: `profile#${participantHandler}`,
        sk: `join_campaign#${campaignId}`,

        campaign: JSON.stringify({
          id: campaignId,
          handler: campaignGet.Item.handler,
          title: campaignGet.Item.title,
          image: campaignGet.Item.image,
        }),

        recipient: campaignGet.Item.profile,

        profile: JSON.stringify({
          id: participantData.id,
          handler: participantData.handler,
          image: participantData.image,
          bio: participantData.bio,
        }),

        notificationType: enums.NOTIFICATION_TYPE.JOIN_CAMPAIGN,

        createdAt,

        // notifications of the user
        gsi1pk: `PROFILE_NOTIFICATIONS#${campaignGet.Item.handler}`,
        gsi1sk: createdAt,

        // notifications of the campaign
        gsi2pk: `CAMPAIGN_NOTIFICATIONS#${campaignId}`,
        gsi2sk: createdAt,

        // participants of the campaign
        gsi3pk: `CAMPAIGN_PARTICIPANTS#${campaignId}`,
        gsi3sk: createdAt,
      },
      ConditionExpression:
        "attribute_not_exists(pk) AND attribute_not_exists(sk)",
    };

    const command = new PutCommand(paramsPut);
    await dynamoDB.send(command);

    return {
      status: "success",
    };
  } catch (error) {
    return makeError(error.message);
  }
};
