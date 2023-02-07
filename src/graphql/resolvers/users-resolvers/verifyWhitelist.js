/*
Description: 
  Verify if a handler is whitelisted for a wallet address
Notice: 
  This mutation checks if the handler is whitelisted for the wallet address in the smart contract. 
  If is not whitelisted, Will try to add the handler to the whitelist in the smart contract by vreifying the twitter account of the handler
Parameters:
  request: VerifyWhitelistInput!
    handler: String!
    tweetUrl: String!
*/

import { makeError } from "../../../utils/index.js";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import axios from "axios";
import dotenv from "dotenv";
import { defaults } from "../../../config/index.js";
dotenv.config();

const { DYNAMODB_TABLE_NAME } = process.env;

function isValidHandler(handler) {
  if (!handler) {
    return false;
  }

  // Length check
  const MIN_LENGTH = 3;
  const MAX_LENGTH = 32;
  if (handler?.length < MIN_LENGTH || handler?.length > MAX_LENGTH) {
    return false;
  }

  // Check if handler has invalid characters
  const pattern = /^[a-z0-9_]+$/;
  return pattern.test(handler);
}

export const verifyWhitelist = async (request, { lambdaContext }) => {
  try {
    const { handler, tweetUrl } = request;
    const { profileContract, dynamoDB, caller } = lambdaContext;

    // Check data
    if (!caller?.address || !handler) {
      return makeError("InvalidParameters");
    }

    // isHandlerWhitelisted in smart contract
    const isHandlerWhitelisted = await profileContract.isHandlerWhitelisted(
      caller.address,
      handler
    );

    if (isHandlerWhitelisted) {
      return {
        status: "whitelisted",
      };
    }

    // Check if requested tweet is published by the handler
    // const requestedTweetText = `${defaults.twitterVerificationTweetText} - @${handler}`;
    // console.log("requestedTweetText", requestedTweetText);
    // const tweetPattern =
    //   /https:\/\/twitter.com\/([a-zA-Z0-9_]{1,15})\/status\/([0-9]{1,20})/g;
    // const isValidTweetUrl = tweetPattern.test(tweetUrl);
    // if (!isValidTweetUrl) {
    //   console.log("InvalidTweet");
    //   return makeError("InvalidTweet");
    // }

    // const tweetId = tweetUrl.match(tweetPattern)[0].split("/").pop();
    // const tweet = await axios.get(
    //   `https://api.twitter.com/2/tweets/${tweetId}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
    //     },
    //   }
    // );

    // // Check if tweet is published by the handler
    // if (!tweet?.data?.data?.text?.includes?.(requestedTweetText)) {
    //   console.log("InvalidTweet");
    //   return makeError("InvalidTweet");
    // }

    // addToWhitelist in smart contract
    const addToWhitelistTx = await profileContract.addToWhitelist(
      caller.address,
      handler
    );
    await addToWhitelistTx.wait();

    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Item: {
        pk: `owner#${caller.address}`,
        sk: `whitelisted_handler#${handler}`,

        handler,
        owner: caller.address,
        createdAt: Date.now().toString(),

        // All whitelisted owners
        gsi1pk: `whitelisted_owners`,
        gsi1sk: `handler#${handler}`,

        // All whitelisted handlers
        gsi2pk: `whitelisted_handlers`,
        gsi2sk: `owner#${caller.address}`,
      },
    };

    const command = new PutCommand(params);
    const data = await dynamoDB.send(command);

    return {
      status: "whitelisted",
    };
  } catch (error) {
    console.error(error);
    return makeError("InvalidParameters");
  }
};
