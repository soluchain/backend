import { types } from "./types/index.js";
import { query } from "./query.js";
import { mutation } from "./mutation.js";

export const typeDefs = [...types, query, mutation];
