// connect to wallet on the server side with private key

const { Wallet } = require("ethers");
const ethers = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const { DISPATCHER_PRIVATE_KEY_LOCAL_TEST, RPC_URL_LOCAL_TEST } = process.env;

// create wallet and signer from private key with PRC
const wallet = new ethers.Wallet(DISPATCHER_PRIVATE_KEY_LOCAL_TEST);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL_LOCAL_TEST);
const signer = wallet.connect(provider);

module.exports = {
  wallet,
  signer,
};
