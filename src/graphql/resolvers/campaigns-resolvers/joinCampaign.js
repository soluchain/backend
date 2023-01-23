/*
Description: 
  Join a campaign
Notice: 
  Before running this mutation, user needs to run the smart contract function "joinCampaign" to join a campaign
Parameters:
  request: JoinCampaignInput!
*/

import { makeError } from "../../../utils/index.js";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
    const denormalizedParticipant = JSON.stringify({
      id: participantData.id,
      handler: participantData.handler,
      image: participantData.image,
      bio: participantData.bio,
    });

    const participantParamsPut = {
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

        profile: denormalizedParticipant,

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

    const participantCommand = new PutCommand(participantParamsPut);
    const participantDataPut = await dynamoDB.send(participantCommand);

    if (!participantDataPut.$metadata.httpStatusCode === 200) {
      return makeError("FailedToJoinCampaign");
    }

    // Add participant to the latestParticipants array of the campaign that max size is 10 items
    const participants = campaignGet.Item.latestParticipants || [];

    if (participants.length === 10) {
      participants.shift();

      participants.push(denormalizedParticipant);
    } else {
      participants.push(denormalizedParticipant);
    }

    const campaignParamsUpdate = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk: `profile#${handler}`,
        sk: `campaign#${campaignId}`,
      },
      UpdateExpression:
        "set latestParticipants = :latestParticipants, participantCount = participantCount + :newParticipantCount",
      ExpressionAttributeValues: {
        ":latestParticipants": participants,
        ":newParticipantCount": 1,
      },
      ReturnValues: "ALL_NEW",
    };

    const campaignCommand = new UpdateCommand(campaignParamsUpdate);
    const campaignDataUpdate = await dynamoDB.send(campaignCommand);

    if (!campaignDataUpdate.$metadata.httpStatusCode === 200) {
      return makeError("FailedToJoinCampaign");
    }

    return {
      status: "success",
    };
  } catch (error) {
    console.log(error);
    return makeError(error.message);
  }
};
