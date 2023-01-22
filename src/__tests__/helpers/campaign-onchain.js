const dotenv = require("dotenv");
const ethers = require("ethers");
const { gql } = require("graphql-request");
const { fetchGQL } = require("./fetchGQL");
const { wallet, signer } = require("./walletConnector");
const campaignABI = require("../../abi/campaign-abi.json");
const profileABI = require("../../abi/profile-abi.json");
const { createProfileOnDB } = require("./profile-onchain");

dotenv.config();
const {
  CAMPAIGN_CONTRACT_ADDRESS_LOCAL_TEST,
  PROFILE_CONTRACT_ADDRESS_LOCAL_TEST,
} = process.env;

const campaignContract = new ethers.Contract(
  CAMPAIGN_CONTRACT_ADDRESS_LOCAL_TEST,
  campaignABI,
  signer
);

const profileContract = new ethers.Contract(
  PROFILE_CONTRACT_ADDRESS_LOCAL_TEST,
  profileABI,
  signer
);
const profile_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmUb8LDuYjUhpyUYtjE12kBiUMEnoxLwa8dQoZJHVYenEp";

const JOIN_CAMPAIGN_MUTATION = gql`
  mutation joinCampaign($request: JoinCampaignInput!) {
    joinCampaign(request: $request) {
      status
      error {
        code
        message
      }
    }
  }
`;

const createCampaignOnChain = async (
  handler,
  campaignContentUri,
  profileContentUri = profile_content_uri
) => {
  // First, create a profile on-chain
  await createProfileOnDB(handler, profileContentUri);

  // Get the profile on-chain
  await profileContract.getProfile(handler);

  const tx = await campaignContract.createCampaign(handler, campaignContentUri);

  await tx.wait();

  // find the campaign id of the newly created campaign
  let campaignCount = await campaignContract.getCampaignCount();

  campaignCount = parseInt(campaignCount);

  return campaignCount;
};

const getCampaignOnChain = async (id) => {
  const campaign = await campaignContract.getCampaign(id);
  return campaign;
};

const createCampaignOnDB = async (
  handler,
  campaignContentUri,
  profileContentUri = profile_content_uri
) => {
  // First, create a campaign on-chain
  const campaignId = await createCampaignOnChain(handler, campaignContentUri);

  // Then, create a campaign on DB
  const CREATE_CAMPAIGN_MUTATION = gql`
    mutation createCampaign($request: CreateCampaignInput!) {
      createCampaign(request: $request) {
        campaign {
          owner
          id
          handler
          title
          description
          image
          status
          contentUri
        }
        error {
          code
          message
        }
      }
    }
  `;

  const data = await fetchGQL(CREATE_CAMPAIGN_MUTATION, {
    request: { id: campaignId },
  });

  return data?.createCampaign;
};

const joinCampaignOnChain = async (campaignId, participantHandler) => {
  const tx = await campaignContract.joinCampaign(
    campaignId,
    participantHandler
  );
  await tx.wait();
  return true;
};

const joinCampaignOnDB = async (campaignId, handler, participantHandler) => {
  await joinCampaignOnChain(campaignId, participantHandler);
  return await fetchGQL(JOIN_CAMPAIGN_MUTATION, {
    request: {
      campaignId,
      handler,
      participantHandler,
    },
  });
};

module.exports = {
  createCampaignOnChain,
  getCampaignOnChain,
  createCampaignOnDB,
  joinCampaignOnChain,
  joinCampaignOnDB,
};
