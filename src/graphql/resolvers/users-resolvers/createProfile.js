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

import {
  ipfsUrlValidator,
  makeError,
  ZERO_ADDRESS,
} from "../../../utils/index.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { defaults } from "../../../config/index.js";
import { ProfileMongoDBModel } from "../../../mongodb-models/index.js";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

const getProfile = async (dynamoDB, { pk, sk }) => {
  const paramsGet = {
    TableName: DYNAMODB_TABLE_NAME,
    Key: {
      pk,
      sk,
    },
  };

  // Get the profile from the database
  const commandGet = new GetCommand(paramsGet);
  return dynamoDB.send(commandGet);
};

export const createProfile = async (request, { lambdaContext }) => {
  try {
    const { profileContract, dynamoDB } = lambdaContext;

    const handler = request.handler.toLowerCase();
    const pk = `profile#${handler}`;
    const sk = `profile#${handler}`;

    // Isert the new profile into the database ONLY if the profile EXISTS in the smart contract
    const profileData = await profileContract.getProfile(handler);
    if (profileData.handler === "" || profileData.owner === ZERO_ADDRESS) {
      return makeError("ProfileDoesNotExist");
    }

    const createdAt = new Date(profileData.createdAt * 1000).toString();

    const {
      isValid: isValidIpfsUrl,
      error: ipfsUrlError,
      content,
    } = await ipfsUrlValidator(profileData.contentUri, "profile");

    if (!content) {
      return ipfsUrlError || makeError("InvalidContentUri");
    }

    // Check if profile already exists
    const profileGet = await getProfile(dynamoDB, { pk, sk });

    // check if handler already exists
    if (profileGet.Item) {
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
        handler,
        contentUri: profileData.contentUri,
        status: defaults.PROFILE_STATUS,
        image: content.image,
        bio: content.bio,
        featured: defaults.FEATURED_PROFILE,
        createdAt: createdAt,
        updatedAt: createdAt,

        // GSI1 for getting all profiles by owner
        gsi1pk: `PROFILE_OWNER#${profileData.owner}`,
        gsi1sk: createdAt,

        // GSI2 for getting all profiles by status
        gsi2pk: `PROFILE_STATUS#${defaults.PROFILE_STATUS}`,
        gsi2sk: createdAt,

        // GSI3 - Campaigns by featured
        gsi3pk: `PROFILE_FEATURED#${defaults.FEATURED_PROFILE}`,
        gsi3sk: createdAt,
      },
    };

    const command = new PutCommand(params);
    const data = await dynamoDB.send(command);

    if (data.$metadata.httpStatusCode === 200) {
      // Create doc in MongoDB
      const profileMongoResult = await ProfileMongoDBModel.create({
        profileId: profileData.id.toString(),
        pk,
        sk,
        owner: profileData.owner,
        handler,
        contentUri: profileData.contentUri,
        status: defaults.PROFILE_STATUS,
        image: content.image,
        bio: content.bio,
        createdAt: createdAt,
        updatedAt: createdAt,
      });

      return {
        profile: profileData,
      };
    }

    return makeError("InternalServerError");
  } catch (error) {
    return {
      error,
    };
  }
};
