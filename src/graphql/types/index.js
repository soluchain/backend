import { scalar } from "./scalar.type.js";
import { errorType } from "./error.type.js";
import { dataType } from "./data.type.js";
import { authenticateType } from "./authenticate.type.js";
import { profileType } from "./profile.type.js";
import { campaignType } from "./campaign.type.js";

export const types = [
  scalar,
  errorType,
  dataType,
  authenticateType,
  profileType,
  campaignType,
];
