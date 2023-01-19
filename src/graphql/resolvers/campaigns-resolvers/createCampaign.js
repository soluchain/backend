/*
Description: 
  Create a new campaign
Notice: 
  Before running this mutation, you need to run the smart contract function "createCampaign" to create a new campaign
  This mutation will insert the new campaign into the database ONLY if the campaign EXISTS in the smart contract
Parameters:
  request: CreateCampaignInput!
    id: String!
*/

import { makeError, ZERO_ADDRESS } from "../../../utils/index.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { defaults, badges, limits } from "../../../config/index.js";
import {
  ipfsUrlValidator,
  getUserBadgesHelper,
  geoJsonAreaValidator,
  titleValidator,
  descriptionValidator,
} from "../../../utils/index.js";
import { CampaignMongoDBModel } from "../../../mongodb-models/index.js";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

const getMaxBadge = async (badgeContract, owner) => {
  const userBadges = await getUserBadgesHelper(badgeContract, owner);

  // Get the max badge of the user
  let maxBadge;
  if (userBadges?.length > 0) {
    // find the max badge of the user based on the badge id (the badge id is the index of the badge in the config.badges array)
    // badges items are BigNumber objects

    maxBadge = userBadges.reduce(
      (max, item) => {
        const badgeId = item.toNumber();

        const badge = badges[badgeId];

        if (badge) {
          if (badge.maxCampaignArea > max.maxCampaignArea) {
            max.maxBadgeId = badgeId;
            max.maxCampaignArea = badge.maxCampaignArea;
          }
        }
        return max;
      },
      {
        maxBadgeId: 0,
        maxCampaignArea: 0,
      }
    );

    return maxBadge;
  }

  return null;
};

const getCampaign = async (dynamoDB, handler, campaignId) => {
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

const getProfile = async (dynamoDB, handler) => {
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

export const createCampaign = async (request, { lambdaContext }) => {
  try {
    const { id } = request;
    const { campaignContract, badgeContract, dynamoDB } = lambdaContext;

    // Insert the new campaign into the database ONLY if the campaign EXISTS in the smart contract
    let campaignData;
    try {
      campaignData = await campaignContract.getCampaign(id);
    } catch (error) {
      return makeError("CampaignDoesNotExist");
    }

    if (
      !campaignData ||
      campaignData.id === "" ||
      campaignData.owner === ZERO_ADDRESS
    ) {
      return makeError("CampaignDoesNotExist");
    }

    const handler = campaignData?.handler?.toLowerCase?.();
    const owner = campaignData?.owner;

    // Validate the ipfs contentUri
    const {
      isValid: isValidIpfsUrl,
      error: ipfsUrlError,
      content,
    } = await ipfsUrlValidator(campaignData.contentUri, "campaign");

    if (!content) {
      return ipfsUrlError || makeError("InvalidContentUri");
    }

    // Validate the campaign title
    const { isValid: isValidTitle, error: titleError } = titleValidator(
      content.title,
      limits.MIN_CAMPAIGN_TITLE_LENGTH,
      limits.MAX_CAMPAIGN_TITLE_LENGTH
    );

    if (!isValidTitle) {
      return { error: titleError };
    }

    // Validate the campaign description
    const { isValid: isValidDescription, error: descriptionError } =
      descriptionValidator(
        content.description,
        limits.MIN_CAMPAIGN_DESCRIPTION_LENGTH,
        limits.MAX_CAMPAIGN_DESCRIPTION_LENGTH
      );
    if (!isValidDescription) {
      return { error: descriptionError };
    }

    // Get the badges of the user and area of the campaign location based on the badge
    // The getUserBadgesHelper functions returns an array of badges ids of the user
    // We will calculate area based on the max badge of the user
    // The max badge is NOT the last badge of the user
    // We will use the config.badges object to get the max area of the campaign location based on the max badge of the user
    const maxBadge = await getMaxBadge(badgeContract, owner);
    if (!maxBadge || maxBadge.maxCampaignArea === 0) {
      return makeError("InsufficientBadge");
    }

    // Check if the campaign location area is less than the limit of the max area that the user can create a campaign
    const { isValid: isValidArea } = geoJsonAreaValidator(
      content.location,
      maxBadge.maxCampaignArea
    );
    if (!isValidArea) {
      return makeError("CampaignAreaExceedsLimit");
    }

    // check if campaign already exists
    const campaignGet = await getCampaign(dynamoDB, handler, campaignData.id);
    if (campaignGet.Item) {
      return makeError("CampaignAlreadyExists");
    }

    // Get the profile to set denormalized data in the campaign
    const profileGet = await getProfile(dynamoDB, handler);
    if (!profileGet.Item) {
      return makeError("ProfileDoesNotExist");
    }
    const denormalizedProfileData = {
      id: profileGet.Item.id,
      handler: profileGet.Item.handler,
      image: profileGet.Item.image,
    };

    // set the params.location if the campaign location
    // we have validated the campaign location area in the previous step
    // so we can set the params.location
    const { location } = content;

    // Insert the new campaign into the database
    const campaignPK = `profile#${handler}`;
    const campaignSK = `campaign#${campaignData.id}`;
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        pk: campaignPK,
        sk: campaignSK,
        id: campaignData.id.toString(),
        owner,
        handler,
        profile: JSON.stringify(denormalizedProfileData),
        contentUri: campaignData.contentUri,
        title: content.title,
        description: content.description,
        status: defaults.CAMPAIGN_STATUS,
        location: JSON.stringify(location.geometry),
        image: content.image,
        createdAt: campaignData.createdAt.toString(),
        updatedAt: campaignData.updatedAt.toString(),

        // GSI1 - Campaigns by owner and query by status and featured
        gsi1pk: `CAMPAIGN_OWNER#${owner}`,
        gsi1sk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}#CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,

        // GSI2 - Campaigns by handler and query by status and featured
        gsi2pk: `CAMPAIGN_PROFILE#${handler}`,
        gsi2sk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}#CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,

        // GSI3 - Campaigns by status
        gsi3pk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}`,
        gsi3sk: campaignData.createdAt.toString(),

        // GSI4 - Campaigns by featured
        gsi4pk: `CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,
        gsi4sk: campaignData.createdAt.toString(),
      },
    };

    const command = new PutCommand(params);
    const data = await dynamoDB.send(command);

    if (data.$metadata.httpStatusCode === 200) {
      // Create doc in MongoDB for querying campaigns by location
      const campaignMongoResult = await CampaignMongoDBModel.create({
        campaignId: campaignData.id.toString(),
        pk: campaignPK,
        sk: campaignSK,
        owner: owner,
        handler,
        profile: denormalizedProfileData,
        contentUri: campaignData.contentUri,
        title: content.title,
        description: content.description,
        status: defaults.CAMPAIGN_STATUS,
        image: content.image,
        location: location.geometry,
        createdAt: new Date(campaignData.createdAt * 1000),
        updatedAt: new Date(campaignData.updatedAt * 1000),
      });

      return {
        campaign: {
          ...campaignData,
          profile: denormalizedProfileData,
          id: campaignData.id.toString(),
          title: content.title,
          description: content.description,
          status: defaults.CAMPAIGN_STATUS,
        },
      };
    }

    return makeError("CampaignCreationFailed");
  } catch (error) {
    console.log(error);
    return {
      error,
    };
  }
};
