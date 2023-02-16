const siwe = require("siwe");
const jwt = require("jsonwebtoken");
const { testUser } = require("./walletConnector");

const generateSampleAccessToken = async () => {
  // await createProfileOnChain(handler, valid_content_uri);
  const siweMessage = new siwe.SiweMessage({
    domain: "localhost:3000",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    statement: "Sign in with Ethereum to the app.",
    uri: "http://localhost:3000",
    version: "1",
    chainId: "31337",
    nonce: "b158c9234b026f0fd0fad7538a45a82235b43a45410c9ef7e97e3b140c4d59f8",
  });

  // sign message
  // const signature = await testUser.signer.signMessage(message.toString());

  const message = siweMessage.prepareMessage();
  const signature = await testUser.signer.signMessage(message.toString());

  // generate jwt token

  const accessToken = jwt.sign(
    {
      message: JSON.stringify(message),
      signature: signature,
    },
    process.env.AUTH_JWT_SECRET
  );

  return accessToken;
};

module.exports = {
  generateSampleAccessToken,
};
