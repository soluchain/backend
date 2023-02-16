/*
Description: 
  Authenticate a user
Notice: 
  Authenticate user based on message signature
Parameters:
  request: AuthenticateInput!
    signature: String!
*/

import dotenv from "dotenv";
import { ethers } from "ethers";
import { makeError } from "../../../utils/index.js";
import { genetateJWT } from "../../../utils/index.js";

dotenv.config();

const { AUTH_MESSAGE } = process.env;

export const authenticate = async (request, { lambdaContext }) => {
  try {
    const { signature } = request;

    // Verify and get wallet address from message signature
    let userAddress = ethers.utils.verifyMessage(AUTH_MESSAGE, signature);
    if (!userAddress) {
      return makeError("InvalidSignature");
    }

    // generate JWT
    const token = genetateJWT({
      address: userAddress,
    });

    if (!token) {
      return makeError();
    }

    return {
      token,
    };
  } catch (error) {
    console.log("error", error);
    return makeError();
  }
};
