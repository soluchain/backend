import { createCampaign } from "./createCampaign.js";
import { getCampaigns } from "./getCampaigns.js";
import { getCampaign } from "./getCampaign.js";
import { joinCampaign } from "./joinCampaign.js";
import { getParticipants } from "./getParticipants.js";
import { getJoinedCampaigns } from "./getJoinedCampaigns.js";

export const campaignsResolvers = {
  Query: {
    getCampaign: (_, { request }, context) => getCampaign(request, context),
    getCampaigns: (_, { request }, context) => getCampaigns(request, context),
    getParticipants: (_, { request }, context) =>
      getParticipants(request, context),
    getJoinedCampaigns: (_, { request }, context) =>
      getJoinedCampaigns(request, context),
  },
  Mutation: {
    createCampaign: (_, { request }, context) =>
      createCampaign(request, context),
    joinCampaign: (_, { request }, context) => joinCampaign(request, context),
  },
};
