const { gql } = require("graphql-request");
const siwe = require("siwe");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createProfileOnChain } = require("../../helpers/profile-onchain.js");
const { testUser } = require("../../helpers/walletConnector");

dotenv.config();

const valid_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmUb8LDuYjUhpyUYtjE12kBiUMEnoxLwa8dQoZJHVYenEp";

const TWEET_URL =
  "https://twitter.com/SoluchainDapp/status/1614076922530787328";

const VERIFY_WHITELIST_MUTATION = gql`
  mutation verifyWhitelist($request: VerifyWhitelistInput!) {
    verifyWhitelist(request: $request) {
      status
      error {
        code
        message
      }
    }
  }
`;

describe("verifyWhitelist", () => {
  test("Should revert if tweetUrl is NOT valid", async () => {
    const data = await fetchGQL(VERIFY_WHITELIST_MUTATION, {
      request: { handler: getValidHandlerRandom(), tweetUrl: "invalid" },
    });

    expect(data?.verifyWhitelist?.status).toBeNull();
    expect(data?.verifyWhitelist?.error?.code).toBe("InvalidTweet");
  });

  test("Should revert if tweetUrl is valid but not included the required text", async () => {
    const data = await fetchGQL(VERIFY_WHITELIST_MUTATION, {
      request: {
        handler: getValidHandlerRandom(),
        tweetUrl:
          "https://twitter.com/SoluchainDapp/status/1614054704610164736", // This tweet does NOT include the required text
      },
    });

    expect(data?.verifyWhitelist?.status).toBeNull();
    expect(data?.verifyWhitelist?.error?.code).toBe("InvalidTweet");
  });

  test("Should add the handler and user address to the whitelist", async () => {
    try {
      const handler = getValidHandlerRandom();

      // await createProfileOnChain(handler, valid_content_uri);
      const siweMessage = new siwe.SiweMessage({
        domain: "localhost:3000",
        address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        statement: "Sign in with Ethereum to the app.",
        uri: "http://localhost:3000",
        version: "1",
        chainId: "31337",
        nonce:
          "b158c9234b026f0fd0fad7538a45a82235b43a45410c9ef7e97e3b140c4d59f8",
      });

      // sign message
      // const signature = await testUser.signer.signMessage(message.toString());

      const message = siweMessage.prepareMessage();

      const signature = await testUser.signer.signMessage(message.toString());

      const { verifyWhitelist } = await fetchGQL(
        VERIFY_WHITELIST_MUTATION,
        {
          request: { handler, tweetUrl: TWEET_URL },
        },
        {
          signature: signature,
          message: JSON.stringify(message),
        }
      );

      expect(verifyWhitelist?.status).toBe("whitelisted");
      expect(verifyWhitelist?.error).toBeNull();
    } catch (error) {
      console.log(error);
    }
  });
});
