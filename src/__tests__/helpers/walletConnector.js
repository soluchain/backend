// connect to wallet on the server side with private key
const ethers = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const {
  DISPATCHER_PRIVATE_KEY_LOCAL_TEST,
  RPC_URL_LOCAL_TEST,
  TEST_USER_PRIVATE_KEY,
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL_LOCAL_TEST);

// DISPATCHER => create wallet and signer from private key with PRC
const wallet = new ethers.Wallet(DISPATCHER_PRIVATE_KEY_LOCAL_TEST);
const signer = wallet.connect(provider);

// TEST USER => create wallet and signer from private key with PRC
const testUserWallet = new ethers.Wallet(TEST_USER_PRIVATE_KEY);
const testUserSigner = testUserWallet.connect(provider);

const testUser = {
  address: testUserWallet.address,
  signer: testUserSigner,
  wallet: testUserWallet,
};

module.exports = {
  wallet,
  signer,
  testUser,
};
