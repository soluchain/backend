import { authenticate } from "./authenticate.js";

export const authenticationResolvers = {
  Mutation: {
    authenticate: (_, { request }, context) => authenticate(request, context),
  },
};
