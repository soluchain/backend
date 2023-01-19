const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createProfileOnDB } = require("../../helpers/profile-onchain.js");

dotenv.config();

const GET_PROFILE_QUERY = gql`
  query getProfile($request: SingleProfileQueryRequest!) {
    getProfile(request: $request) {
      profile {
        id
        handler
      }
      error {
        code
        message
      }
    }
  }
`;

describe("getProfile", () => {
  test("should return profile", async () => {
    const handler = getValidHandlerRandom();

    const contentUri = "https://test.com";

    await createProfileOnDB(handler, contentUri);

    const data = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler },
    });

    expect(data?.getProfile?.profile?.handler).toBe(handler);
    expect(data?.getProfile?.error).toBeNull();
  });

  test("should return error if profile does not exist", async () => {
    const handler = getValidHandlerRandom();

    const data = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler },
    });

    expect(data?.getProfile?.profile).toBeNull();
    expect(data?.getProfile?.error?.code).toBe("ProfileDoesNotExist");
  });
});
