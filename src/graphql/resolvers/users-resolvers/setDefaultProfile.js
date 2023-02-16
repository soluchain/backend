/*
Description: 
  Set a profile as default
Parameters:
  request: SetDefaultProfileInput!
    handler: String!
*/

import { makeError } from "../../../utils/index.js";
import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const setDefaultProfile = async (request, { lambdaContext }) => {
  try {
    const { handler } = request;
    const { profileContract, dynamoDB, caller } = lambdaContext;

    // Initial checks parameters
    if (!caller?.address || !handler) {
      return makeError("InvalidParameters");
    }

    // Get all the profiles of the owner
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      IndexName: "gsi1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": `PROFILE_OWNER#${caller.address}`,
      },
    };
    const command = new QueryCommand(params);
    const data = await dynamoDB.send(command);
    if (!data?.Items?.length) {
      return makeError("OwnerHasNoProfile");
    }

    // Get the default profile and the profile to set as default
    let defaultProfile;
    let handlerProfile;
    for (const profile of data.Items) {
      if (profile.isDefault) {
        defaultProfile = profile;
      }
      if (profile.handler === handler) {
        handlerProfile = profile;
      }

      if (defaultProfile && handlerProfile) {
        break;
      }
    }

    // Check if handler is the default profile
    if (defaultProfile?.handler === handler) {
      return makeError("ProfileIsAlreadyDefault");
    }

    // Check if the given handler is valid
    if (!handlerProfile) {
      return makeError("ProfileDoesNotExist");
    }

    // Make a transaction to update the profiles
    const TransactItems = [
      {
        Update: {
          TableName: DYNAMODB_TABLE_NAME,
          Key: {
            pk: handlerProfile.pk,
            sk: handlerProfile.sk,
          },
          UpdateExpression: "SET isDefault = :isDefault",
          ExpressionAttributeValues: {
            ":isDefault": true,
          },
        },
      },
    ];

    if (defaultProfile) {
      TransactItems.push({
        Update: {
          TableName: DYNAMODB_TABLE_NAME,
          Key: {
            pk: defaultProfile.pk,
            sk: defaultProfile.sk,
          },
          UpdateExpression: "SET isDefault = :isDefault",
          ExpressionAttributeValues: {
            ":isDefault": false,
          },
        },
      });
    }

    const commandTransact = new TransactWriteCommand({
      TransactItems,
    });

    try {
      await dynamoDB.send(commandTransact);

      return {
        success: true,
      };
    } catch (error) {
      console.error(`Error occurred while updating profiles: ${error}`);
      return makeError("InternalServerError");
    }
  } catch (error) {
    console.error(error);
    return makeError("InternalServerError");
  }
};
