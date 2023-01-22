const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const {
  createCampaignOnDB,
  createProfileOnDB,
  joinCampaignOnChain,
} = require("../../helpers/index.js");

dotenv.config();

const GET_PROFILE_QUERY = gql`
  query getProfile($request: SingleProfileQueryRequest!) {
    getProfile(request: $request) {
      profile {
        id
        handler
        contentUri
        image
      }
      error {
        code
        message
      }
    }
  }
`;

const JOIN_CAMPAIGN_MUTATION = gql`
  mutation joinCampaign($request: JoinCampaignInput!) {
    joinCampaign(request: $request) {
      status
      error {
        code
        message
      }
    }
  }
`;

const profile_valid_content_uri_1 =
  "https://soluchain.infura-ipfs.io/ipfs/QmUb8LDuYjUhpyUYtjE12kBiUMEnoxLwa8dQoZJHVYenEp";
const profile_valid_content_uri_2 =
  "https://soluchain.infura-ipfs.io/ipfs/QmQFVVsXp7PJSVQxcmuyLGXtPKQVLqb65Ztuia2328pD8A";
const campaign_valid_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmS942X7HR8Sfr5vVNydfmz4d23pJmtZawmSnoGMpfcWwQ";

describe("joinCampaign", () => {
  let profile_1;
  let profile_2;
  let campaign;

  beforeAll(async () => {
    const handler_1 = getValidHandlerRandom();
    const handler_2 = getValidHandlerRandom();

    // Create profile 1 and campaign for profile 1
    const createCampaignRes = await createCampaignOnDB(
      handler_1,
      campaign_valid_content_uri,
      profile_valid_content_uri_1
    );

    campaign = createCampaignRes?.campaign;

    // Create profile 2
    await createProfileOnDB(handler_2, profile_valid_content_uri_2);

    // Get profile 1
    const profile_1_res = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler: handler_1 },
    });

    profile_1 = profile_1_res?.getProfile?.profile;

    // Get profile 2
    const profile_2_res = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler: handler_2 },
    });

    profile_2 = profile_2_res?.getProfile?.profile;

    // Join campaign on chain
    await joinCampaignOnChain(campaign.id, profile_2.handler);
  });

  test("should join campaign", async () => {
    const data = await fetchGQL(JOIN_CAMPAIGN_MUTATION, {
      request: {
        campaignId: campaign.id,
        handler: profile_1.handler,
        participantHandler: profile_2.handler,
      },
    });

    const { status, error } = data?.joinCampaign;

    expect(status).toBe("success");
    expect(error).toBeNull();
  });

  test("should return error if campaign does not exist", async () => {
    const data = await fetchGQL(JOIN_CAMPAIGN_MUTATION, {
      request: {
        campaignId: "1234567890",
        handler: profile_1.handler,
        participantHandler: profile_2.handler,
      },
    });

    const { error } = data?.joinCampaign;

    expect(error?.code).toBe("CampaignDoesNotExist");
  });

  test("should return error if profile does not exist", async () => {
    const data = await fetchGQL(JOIN_CAMPAIGN_MUTATION, {
      request: {
        campaignId: campaign.id,
        handler: profile_1.handler,
        participantHandler: "non-existing-handler",
      },
    });

    const { error } = data?.joinCampaign;

    expect(error?.code).toBe("NotJoinedCampaignInProfileContract");
  });
});
