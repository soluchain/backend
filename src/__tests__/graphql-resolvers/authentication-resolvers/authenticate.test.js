const { gql } = require("graphql-request");
const dotenv = require("dotenv");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const { createProfileOnDB } = require("../../helpers/profile-onchain.js");
const { signer } = require("../../helpers/walletConnector.js");

dotenv.config();

const { AUTH_MESSAGE } = process.env;

const AUTHENTICATE_MUTATION = gql`
  mutation authenticate($request: AuthenticateInput!) {
    authenticate(request: $request) {
      token
      error {
        code
        message
      }
    }
  }
`;

const authenticate = async () => {
  const handler = getValidHandlerRandom();
  const contentUri =
    "https://soluchain.infura-ipfs.io/ipfs/QmUb8LDuYjUhpyUYtjE12kBiUMEnoxLwa8dQoZJHVYenEp";
  await createProfileOnDB(handler, contentUri);

  const signature = await signer.signMessage(AUTH_MESSAGE);

  const data = await fetchGQL(AUTHENTICATE_MUTATION, {
    request: { signature },
  });

  return data;
};

describe("authenticate", () => {
  test("should authenticate a user", async () => {
    const data = await authenticate();

    expect(data?.authenticate?.error).toBeNull();
    expect(data?.authenticate?.token).not.toBeNull();
  });

  test("should NOT authenticate a user", async () => {
    const data = await fetchGQL(AUTHENTICATE_MUTATION, {
      request: { signature: "0x" },
    });

    expect(data?.authenticate?.token).toBeNull();
  });
});
