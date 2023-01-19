/*
Description: Get Profiles
Parameters:
  request: ProfilesQueryRequest!
*/

import { makeError } from "../../../utils/index.js";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import { enums, limits } from "../../../config/index.js";

dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getProfiles = async (request, { lambdaContext }) => {
  try {
    const { limit, nextToken, orderBy, featured, owner } = request;
    const { dynamoDB } = lambdaContext;

    // Check if limit is too large (limit > limits.MAX_CAMPAIGNS_PER_PAGE)
    if (limit > limits.MAX_PROFILES_PER_PAGE) return makeError("LimitTooLarge");

    // Decode the nextToken if it exists and convert it to an object
    // that can be used in the DynamoDB query
    const decodedNextToken = nextToken
      ? JSON.parse(Buffer.from(nextToken, "base64").toString("ascii"))
      : null;

    // Get the profiles from the database
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      IndexName: "gsi2",
      KeyConditionExpression: "gsi2pk = :status",
      ExpressionAttributeValues: {
        ":status": `PROFILE_STATUS#${enums.PROFILE_STATUS.ACTIVE}`,
      },
      Limit: limit,
    };

    // filter by owner
    if (owner) {
      params.IndexName = "gsi1";
      params.KeyConditionExpression = "gsi1pk = :owner";
      params.ExpressionAttributeValues = {
        ":owner": `PROFILE_OWNER#${owner}`,
      };
    }

    // filter by orderBy
    if (orderBy === "latest") {
      params.ScanIndexForward = false;
    } else if (orderBy === "oldest") {
      params.ScanIndexForward = true;
    }

    // filter by featured
    if (featured) {
      params.IndexName = "gsi3";
      params.KeyConditionExpression = "gsi3pk = :featured";
      params.ExpressionAttributeValues = {
        ":featured": "PROFILE_FEATURED#true",
      };
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
