const dotenv = require("dotenv");
const ethers = require("ethers");
const { gql } = require("graphql-request");
const { fetchGQL } = require("./fetchGQL");
const { wallet, signer } = require("./walletConnector");
const profileABI = require("../../abi/profile-abi.json");

dotenv.config();

const { PROFILE_CONTRACT_ADDRESS_LOCAL_TEST } = process.env;

const getProfileContract = (_signer) => {
  const profileContract = new ethers.Contract(
    PROFILE_CONTRACT_ADDRESS_LOCAL_TEST,
    profileABI,
    _signer
  );

  return profileContract;
};

const createProfileOnChain = async (handler, contentUri, _signer = signer) => {
  const profileContract = getProfileContract(_signer);
  const tx = await profileContract.createProfile(handler, contentUri);
  await tx.wait();

  return tx;
};

const getProfileOnChain = async (handler, _signer = signer) => {
  const profileContract = getProfileContract(_signer);
  const profile = await profileContract.getProfile(handler);
  return profile;
};

const createProfileOnDB = async (handler, contentUri, _signer = signer) => {
  // First, create a profile on-chain
  await createProfileOnChain(handler, contentUri, _signer);

  // Then, create a profile on DB
  const CREATE_PROFILE_MUTATION = gql`
    mutation createProfile($request: CreateProfileInput!) {
      createProfile(request: $request) {
        profile {
          handler
        }
      }
    }
  `;

  const data = await fetchGQL(CREATE_PROFILE_MUTATION, {
    request: { handler },
  });

  return data;
};

module.exports = {
  createProfileOnChain,
  getProfileOnChain,
  createProfileOnDB,
};
