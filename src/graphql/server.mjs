import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import mongoose from "mongoose";
import { typeDefs } from "./index.js";
import { resolvers } from "./resolvers/index.js";
import profileAbi from "../abi/profile-abi.json" assert { type: "json" };
import campaignAbi from "../abi/campaign-abi.json" assert { type: "json" };
import soluchainBadgeAbi from "../abi/soluchain-badge-abi.json" assert { type: "json" };
import * as dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { dispatcherSigner } from "../utils/index.js";

dotenv.config();
const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_CLUSTER,
  MONGODB_DB_NAME,
  AWS_DYNAMO_DB_ACCESS_KEY_ID,
  AWS_DYNAMO_DB_SECRET_ACCESS_KEY,
} = process.env;

const getContracts = () => {
  const profileContract = new ethers.Contract(
    process.env.PROFILE_CONTRACT_ADDRESS,
    profileAbi,
    dispatcherSigner
  );
  const campaignContract = new ethers.Contract(
    process.env.CAMPAIGN_CONTRACT_ADDRESS,
    campaignAbi,
    dispatcherSigner
  );
  const badgeContract = new ethers.Contract(
    process.env.SOLUCHAIN_BADGE_CONTRACT_ADDRESS,
    soluchainBadgeAbi,
    dispatcherSigner
  );

  return {
    profileContract,
    campaignContract,
    badgeContract,
  };
};

const ctx = async ({ event, context }) => {
  try {
    const { profileContract, campaignContract, badgeContract } = getContracts();

    const dbUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;
    const mongooseConnection = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.set("strictQuery", true);

    context.mongooseConnection = mongooseConnection;
    context.profileContract = profileContract;
    context.campaignContract = campaignContract;
    context.badgeContract = badgeContract;
    context.dispatcherSigner = dispatcherSigner;
    context.caller = {};

    // headers
    // context.signer = event.headers.signer || null;

    if (event.headers.signature && event.headers.message) {
      // validate signature
      const msg = JSON.parse(event.headers.message);
      const siweMessage = new SiweMessage(msg.toString());
      const signature = event.headers.signature;

      const validated = await siweMessage.validate(signature);

      if (validated) {
        context.caller = validated;
      }
    }

    // dynamodb connection
    const dynamoDB = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: AWS_DYNAMO_DB_ACCESS_KEY_ID,
        secretAccessKey: AWS_DYNAMO_DB_SECRET_ACCESS_KEY,
      },
    });

    context.dynamoDB = dynamoDB;
  } catch (error) {
    console.log("error", error);
  } finally {
    return {
      lambdaEvent: event,
      lambdaContext: context,
    };
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(server, {
  context: ctx,
});
