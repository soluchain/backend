import { createCampaign } from "./createCampaign.js";
import { getCampaigns } from "./getCampaigns.js";
import { getCampaign } from "./getCampaign.js";
import { joinCampaign } from "./joinCampaign.js";

export const campaignsResolvers = {
  Query: {
    getCampaign: (_, { request }, context) => getCampaign(request, context),
    getCampaigns: (_, { request }, context) => getCampaigns(request, context),
  },
  Mutation: {
    createCampaign: (_, { request }, context) =>
      createCampaign(request, context),
    joinCampaign: (_, { request }, context) => joinCampaign(request, context),
  },
};
