const { gql } = require("graphql-request");
const siwe = require("siwe");
const jwt = require("jsonwebtoken");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createProfileOnChain } = require("../../helpers/profile-onchain.js");
const { testUser } = require("../../helpers/walletConnector");
const { generateSampleAccessToken } = require("../../helpers");

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

      const accessToken = generateSampleAccessToken();

      const { verifyWhitelist } = await fetchGQL(
        VERIFY_WHITELIST_MUTATION,
        {
          request: { handler, tweetUrl: TWEET_URL },
        },
        {
          Authorization: accessToken,
        }
      );

      expect(verifyWhitelist?.status).toBe("whitelisted");
      expect(verifyWhitelist?.error).toBeNull();
    } catch (error) {
      console.log(error);
    }
  });
});
