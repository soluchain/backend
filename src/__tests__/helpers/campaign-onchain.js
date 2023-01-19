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

const createCampaignOnChain = async (handler, contentUri) => {
  // First, create a profile on-chain
  await createProfileOnDB(handler, contentUri);

  // Get the profile on-chain
  await profileContract.getProfile(handler);

  const tx = await campaignContract.createCampaign(handler, contentUri);

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

const createCampaignOnDB = async (handler, contentUri) => {
  // First, create a campaign on-chain
  const campaignId = await createCampaignOnChain(handler, contentUri);

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

module.exports = {
  createCampaignOnChain,
  getCampaignOnChain,
  createCampaignOnDB,
};
