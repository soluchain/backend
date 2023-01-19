import { authenticationResolvers } from "./authentication-resolvers/index.js";
import { usersResolvers } from "./users-resolvers/index.js";
import { campaignsResolvers } from "./campaigns-resolvers/index.js";

export const resolvers = [
  authenticationResolvers,
  usersResolvers,
  campaignsResolvers,
];
