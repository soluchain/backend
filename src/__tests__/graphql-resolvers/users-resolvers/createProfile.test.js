const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createProfileOnChain } = require("../../helpers/profile-onchain.js");

dotenv.config();

const CREATE_PROFILE_MUTATION = gql`
  mutation createProfile($request: CreateProfileInput!) {
    createProfile(request: $request) {
      profile {
        id
        owner
        handler
        contentUri
        status
        featured
        createdAt
        updatedAt
      }
      error {
        code
        message
      }
    }
  }
`;

describe("createProfile", () => {
  test("should revert if profile is NOT created on-chain", async () => {
    const data = await fetchGQL(CREATE_PROFILE_MUTATION, {
      request: { handler: getValidHandlerRandom() },
    });

    expect(data?.createProfile?.profile).toBeNull();
    expect(data?.createProfile?.error?.code).toBe("ProfileDoesNotExist");
  });

  test("should create a new profile", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = "https://test.com";

    await createProfileOnChain(handler, contentUri);

    const data = await fetchGQL(CREATE_PROFILE_MUTATION, {
      request: { handler },
    });

    expect(data?.createProfile?.profile?.handler).toBe(handler);
    expect(data?.createProfile?.profile?.contentUri).toBe(contentUri);
    expect(data?.createProfile?.error).toBeNull();
  });
});
