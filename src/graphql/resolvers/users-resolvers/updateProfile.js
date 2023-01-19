/*
Description: Update a profile
Notice: Before running this mutation, you need to run the smart contract function "updateProfile" to update a profile
Parameters:
  request: UpdateProfileInput!
    handler: String!
*/

import { makeError } from "../../../utils/index.js";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const updateProfile = async (request, { lambdaContext }) => {
  try {
    const { handler } = request;
    const { profileContract, dynamoDB } = lambdaContext;

    // Get the profile from smart contract
    const profileData = await profileContract.getProfile(handler);
    if (profileData.handler === "" || profileData.owner === ZERO_ADDRESS) {
      return makeError("ProfileDoesNotExist");
    }

    // Update the profile in the database
    // Notice: Only contentUri can be updated
    // Should revert if the profile does not exist
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk: `profile#${handler.toLowerCase()}`,
        sk: `profile#${handler.toLowerCase()}`,
      },
      UpdateExpression: "set contentUri = :contentUri",
      ExpressionAttributeValues: {
        ":contentUri": profileData.contentUri,
      },
      ReturnValues: "ALL_NEW",
    };

    const command = new UpdateCommand(params);
    const data = await dynamoDB.send(command);

    // check if profile exists
    if (!data.Item) {
      return makeError("ProfileDoesNotExist");
    }

    return {
      profile: data.Item,
    };
  } catch (error) {
    console.error(error);
    return makeError("InternalServerError");
  }
};
