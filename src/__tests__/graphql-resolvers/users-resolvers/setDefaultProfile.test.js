const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createProfileOnDB } = require("../../helpers/profile-onchain.js");
const { generateSampleAccessToken, testUser } = require("../../helpers");

dotenv.config();

const valid_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmUb8LDuYjUhpyUYtjE12kBiUMEnoxLwa8dQoZJHVYenEp";

const SET_DEFAULT_PROFILE_MUTATION = gql`
  mutation setDefaultProfile($request: SetDefaultProfileInput!) {
    setDefaultProfile(request: $request) {
      success
      error {
        code
        message
      }
    }
  }
`;

describe("setDefaultProfile", () => {
  let header = null;

  beforeAll(async () => {
    const accessToken = await generateSampleAccessToken();
    header = {
      Authorization: accessToken,
    };
  });

  test("should revert if handler is NOT valid", async () => {
    const data = await fetchGQL(
      SET_DEFAULT_PROFILE_MUTATION,
      {
        request: { handler: getValidHandlerRandom() },
      },
      header
    );

    expect(data?.setDefaultProfile?.success).toBe(false);
    expect(["ProfileDoesNotExist", "OwnerHasNoProfile"]).toContain(
      data?.setDefaultProfile?.error?.code
    );
  });

  test("should set the default profile", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = valid_content_uri;

    await createProfileOnDB(handler, contentUri, testUser.signer);

    const data = await fetchGQL(
      SET_DEFAULT_PROFILE_MUTATION,
      {
        request: { handler },
      },
      header
    );

    expect(data?.setDefaultProfile?.success).toBe(true);
    expect(data?.setDefaultProfile?.error).toBeNull();
  });

  test("should revert if handler is already the default profile", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = valid_content_uri;

    await createProfileOnDB(handler, contentUri, testUser.signer);

    await fetchGQL(
      SET_DEFAULT_PROFILE_MUTATION,
      {
        request: { handler },
      },
      header
    );

    const data = await fetchGQL(
      SET_DEFAULT_PROFILE_MUTATION,
      {
        request: { handler },
      },
      header
    );

    expect(data?.setDefaultProfile?.success).toBe(false);
    expect(data?.setDefaultProfile?.error?.code).toBe(
      "ProfileIsAlreadyDefault"
    );
  });
});
