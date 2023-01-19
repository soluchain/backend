/*
Description: Get Campaigns
Parameters:
  request: CampaignsQueryRequest!
*/

import { makeError } from "../../../utils/index.js";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { enums, limits } from "../../../config/index.js";
import { CampaignMongoDBModel } from "../../../mongodb-models/campaign.mongodb-model.js";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getCampaigns = async (request, { lambdaContext }) => {
  try {
    const {
      limit,
      nextToken,
      orderBy,
      featured,
      status,
      owner,
      profile,
      location,
    } = request;
    const { dynamoDB } = lambdaContext;

    const validStatus = enums.CAMPAIGN_STATUS.ACTIVE; // For now, only get active campaigns

    // Check if limit is too large (limit > limits.MAX_CAMPAIGNS_PER_PAGE)
    if (limit > limits.MAX_CAMPAIGNS_PER_PAGE)
      return makeError("LimitTooLarge");

    // Decode the nextToken if it exists and convert it to an object
    // that can be used in the DynamoDB query
    const decodedNextToken = nextToken
      ? JSON.parse(Buffer.from(nextToken, "base64").toString("ascii"))
      : null;

    // get the campaigns by status
    const params = {
      IndexName: "gsi3",
      TableName: DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "gsi3pk = :gsi3pk",
      ExpressionAttributeValues: {
        ":gsi3pk": `CAMPAIGN_STATUS#${validStatus}`,
      },
      Limit: limit,
    };

    // Filter by owner (gsi1pk) and status,featured (gsi1pk)
    // gsi1pk: `CAMPAIGN_OWNER#${campaignData.owner}`,
    // gsi1sk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}#CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,
    if (owner) {
      params.IndexName = "gsi1";
      params.KeyConditionExpression = "gsi1pk = :gsi1pk AND gsi1sk = :gsi1sk";
      params.ExpressionAttributeValues = {
        ":gsi1pk": `CAMPAIGN_OWNER#${owner}`,
        ":gsi1sk": `CAMPAIGN_STATUS#${validStatus}#CAMPAIGN_FEATURED#${!!featured}`,
      };
    }

    // Filter by profile
    // gsi2pk: `CAMPAIGN_PROFILE#${campaignData.profile}`,
    // gsi2sk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}#CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,
    if (profile) {
      params.IndexName = "gsi2";
      params.KeyConditionExpression = "gsi2pk = :gsi2pk AND gsi2sk = :gsi2sk";
      params.ExpressionAttributeValues = {
        ":gsi2pk": `CAMPAIGN_PROFILE#${profile}`,
        ":gsi2sk": `CAMPAIGN_STATUS#${validStatus}#CAMPAIGN_FEATURED#${!!featured}`,
      };
    }

    // Filter by status
    // gsi3pk: `CAMPAIGN_STATUS#${defaults.CAMPAIGN_STATUS}`,
    // gsi3sk: `CAMPAIGN_CREATED_AT#${campaignData.createdAt}`,
    if (status) {
      params.IndexName = "gsi3";
      params.KeyConditionExpression = "gsi3pk = :gsi3pk";
      params.ExpressionAttributeValues = {
        ":gsi3pk": `CAMPAIGN_STATUS#${validStatus}`,
      };
    }

    // Filter by featured
    // gsi4pk: `CAMPAIGN_FEATURED#${defaults.FEATURED_CAMPAIGN}`,
    // gsi4sk: `CAMPAIGN_CREATED_AT#${campaignData.createdAt}`,
    if (featured) {
      params.IndexName = "gsi4";
      params.KeyConditionExpression = "gsi4pk = :gsi4pk";
      params.ExpressionAttributeValues = {
        ":gsi4pk": `CAMPAIGN_FEATURED#${!!featured}`,
      };
    }

    // Filter by location
    // We use MongoDB's geospatial queries to get the campaigns
    // Search for campaigns that polygon contains the location
    if (location) {
      const campaigns = await CampaignMongoDBModel.find({
        status: validStatus,

        location: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [location.lng, location.lat],
            },
          },
        },
      });

      return {
        items: campaigns,
        nextToken: null,
      };
    }

    // filter by orderBy
    if (orderBy === "latest") {
      params.ScanIndexForward = false;
    } else if (orderBy === "oldest") {
      params.ScanIndexForward = true;
    }

    // If there is a nextToken, add it to the query
    // so that the query can continue where it left off
    // from the previous query
    if (decodedNextToken) {
      params.ExclusiveStartKey = decodedNextToken;
    }

    const command = new QueryCommand(params);
    const data = await dynamoDB.send(command);

    // Encode the nextToken so that it can be sent to the client
    // and used in the next query
    const nextTokenEncoded = data.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString("base64")
      : null;

    return {
      items: data.Items,
      nextToken: nextTokenEncoded,
    };
  } catch (error) {
    console.log(error);
    return makeError("InternalServerError");
  }
};
