const { wallet, signer, testUser } = require("./walletConnector");

const {
  generateSampleAccessToken,
} = require("./generate-sample-access-token.js");

const {
  createProfileOnChain,
  getProfileOnChain,
  createProfileOnDB,
} = require("./profile-onchain.js");
const {
  createCampaignOnChain,
  getCampaignOnChain,
  createCampaignOnDB,
  joinCampaignOnChain,
  joinCampaignOnDB,
} = require("./campaign-onchain.js");

module.exports = {
  wallet,
  signer,
  testUser,

  generateSampleAccessToken,

  createProfileOnChain,
  getProfileOnChain,
  createProfileOnDB,

  createCampaignOnChain,
  getCampaignOnChain,
  createCampaignOnDB,
  joinCampaignOnChain,
  joinCampaignOnDB,
};
