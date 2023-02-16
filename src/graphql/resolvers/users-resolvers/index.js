import { createProfile } from "./createProfile.js";
import { setDefaultProfile } from "./setDefaultProfile.js";
import { getProfile } from "./getProfile.js";
import { getProfiles } from "./getProfiles.js";
import { verifyWhitelist } from "./verifyWhitelist.js";

export const usersResolvers = {
  Query: {
    getProfile: (_, { request }, context) => getProfile(request, context),
    getProfiles: (_, { request }, context) => getProfiles(request, context),
  },
  Mutation: {
    verifyWhitelist: (_, { request }, context) =>
      verifyWhitelist(request, context),
    createProfile: (_, { request }, context) => createProfile(request, context),
    setDefaultProfile: (_, { request }, context) =>
      setDefaultProfile(request, context),
  },
};
