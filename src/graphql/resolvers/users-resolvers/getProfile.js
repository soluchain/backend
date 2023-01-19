/*
Description: Get a profile
Parameters:
  request: SingleProfileQueryRequest!
*/

import { makeError } from "../../../utils/index.js";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

export const getProfile = async (request, { lambdaContext }) => {
  try {
    const { handler } = request;
    const { dynamoDB } = lambdaContext;

    // Get the profile from the database
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk: `profile#${handler.toLowerCase()}`,
        sk: `profile#${handler.toLowerCase()}`,
      },
    };

    const command = new GetCommand(params);
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
