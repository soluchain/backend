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
} = require("./campaign-onchain.js");

module.exports = {
  createProfileOnChain,
  getProfileOnChain,
  createProfileOnDB,

  createCampaignOnChain,
  getCampaignOnChain,
  createCampaignOnDB,
  joinCampaignOnChain,
};
