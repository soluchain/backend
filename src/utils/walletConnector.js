// connect to wallet on the server side with the dispatcher private key
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const { DISPATCHER_PRIVATE_KEY_LOCAL_TEST, RPC_URL_LOCAL_TEST } = process.env;

// create wallet and signer from private key with PRC
export const provider = new ethers.providers.JsonRpcProvider(
  RPC_URL_LOCAL_TEST
);
export const dispatcherWallet = new ethers.Wallet(
  DISPATCHER_PRIVATE_KEY_LOCAL_TEST
);
export const dispatcherSigner = dispatcherWallet.connect(provider);
