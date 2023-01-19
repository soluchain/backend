/*
Description: 
  Create a new profile
Notice: 
  Before running this mutation, you need to run the smart contract function "createProfile" to create a new profile
  This mutation will insert the new profile into the database ONLY if the profile EXISTS in the smart contract 
Parameters:
  request: CreateProfileInput!
    handler: String!
*/

import { makeError, ZERO_ADDRESS } from "../../../utils/index.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { defaults } from "../../../config/index.js";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const createProfile = async (request, { lambdaContext }) => {
  try {
    const { handler } = request;
    const { profileContract, dynamoDB } = lambdaContext;

    // Isert the new profile into the database ONLY if the profile EXISTS in the smart contract
    const profileData = await profileContract.getProfile(handler);
    if (profileData.handler === "" || profileData.owner === ZERO_ADDRESS) {
      return makeError("ProfileDoesNotExist");
    }

    const pk = `profile#${profileData.handler.toLowerCase()}`;
    const sk = `profile#${profileData.handler.toLowerCase()}`;

    // Check if the profile already exists in the database
    const paramsGet = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk,
        sk,
      },
    };

    // Get the profile from the database
    const commandGet = new GetCommand(paramsGet);
    const dataGet = await dynamoDB.send(commandGet);

    // check if handler already exists
    if (dataGet.Item) {
      return makeError("ProfileAlreadyExists");
    }

    // Insert the new profile into the database
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        pk,
        sk,
        id: profileData.id.toString(),
        owner: profileData.owner,
        handler: profileData.handler,
        contentUri: profileData.contentUri,
        status: defaults.PROFILE_STATUS,
        featured: defaults.FEATURED_PROFILE,
        createdAt: profileData.createdAt.toString(),
        updatedAt: profileData.updatedAt.toString(),

        // GSI1 for getting all profiles by owner
        gsi1pk: `PROFILE_OWNER#${profileData.owner}`,
        gsi1sk: profileData.createdAt.toString(),

        // GSI2 for getting all profiles by status
        gsi2pk: `PROFILE_STATUS#${defaults.PROFILE_STATUS}`,
        gsi2sk: `PROFILE_CREATED_AT#${profileData.createdAt.toString()}`,

        // GSI3 - Campaigns by featured
        gsi3pk: `PROFILE_FEATURED#${defaults.FEATURED_PROFILE}`,
        gsi3sk: `PROFILE_CREATED_AT#${profileData.createdAt.toString()}`,
      },
    };

    const command = new PutCommand(params);
    const data = await dynamoDB.send(command);

    if (data.$metadata.httpStatusCode !== 200) {
      return makeError("InternalServerError");
    }

    return {
      profile: profileData,
    };
  } catch (error) {
    return {
      error,
    };
  }
};
