const axios = require("axios");

const projectId = process.env.INFURA_PROJECT_ID;
const secret = process.env.INFURA_API_KEY_SECRET;

if (!projectId || !secret) {
  throw new Error(
    "Must define INFURA_PROJECT_ID and INFURA_API_KEY_SECRET in the .env to run this"
  );
}

const getUriByIpfsPath = (path) => {
  if (!path) {
    return "";
  }

  return `https://soluchain.infura-ipfs.io/ipfs/${path}`;
};

const uploadJsonToIpfsUsingInfuraAPI = async (obj) => {
  const body = JSON.stringify({
    data: obj,
  });

  const auth = Buffer.from(`${projectId}:${secret}`).toString("base64");

  const headers = {
    "content-Type": "application/json",
    Authorization: `Bearer ${auth}`,
  };

  const response = await axios.post(
    "https://ipfs.infura.io:5001/api/v0/add",
    body,
    { headers }
  );

  return response.data.Hash;
};

module.exports = {
  getUriByIpfsPath,
  uploadJsonToIpfsUsingInfuraAPI,
};
