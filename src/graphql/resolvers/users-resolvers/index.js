import { createProfile } from "./createProfile.js";
import { getProfile } from "./getProfile.js";
import { getProfiles } from "./getProfiles.js";

export const usersResolvers = {
  Query: {
    getProfile: (_, { request }, context) => getProfile(request, context),
    getProfiles: (_, { request }, context) => getProfiles(request, context),
  },
  Mutation: {
    createProfile: (_, { request }, context) => createProfile(request, context),
  },
};
