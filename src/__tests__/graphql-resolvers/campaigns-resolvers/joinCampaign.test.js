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

const GET_CAMPAIGN_QUERY = gql`
  query getCampaign($request: SingleCampaignQueryRequest!) {
    getCampaign(request: $request) {
      campaign {
        owner
        id
        handler
        title
        description
        image
        status
        contentUri
        latestParticipants {
          id
          handler
          image
          bio
        }
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
  let profile_3;
  let campaign;

  beforeAll(async () => {
    const handler_1 = getValidHandlerRandom();
    const handler_2 = getValidHandlerRandom();
    const handler_3 = getValidHandlerRandom();

    // Create profile 1 and campaign for profile 1
    const createCampaignRes = await createCampaignOnDB(
      handler_1,
      campaign_valid_content_uri,
      profile_valid_content_uri_1
    );

    campaign = createCampaignRes?.campaign;

    // Get profile 1
    const profile_1_res = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler: handler_1 },
    });

    profile_1 = profile_1_res?.getProfile?.profile;

    // Create and get profile 2
    await createProfileOnDB(handler_2, profile_valid_content_uri_2);
    const profile_2_res = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler: handler_2 },
    });
    profile_2 = profile_2_res?.getProfile?.profile;

    // Create and get profile 3
    await createProfileOnDB(handler_3, profile_valid_content_uri_2);
    const profile_3_res = await fetchGQL(GET_PROFILE_QUERY, {
      request: { handler: handler_3 },
    });
    profile_3 = profile_3_res?.getProfile?.profile;

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

  test("should add participant to the latest participants list of the campaign", async () => {
    const data = await fetchGQL(GET_CAMPAIGN_QUERY, {
      request: { id: campaign.id, handler: campaign.handler },
    });

    campaign = data?.getCampaign?.campaign;
    const { error } = data?.getCampaign;

    expect(error).toBeNull();
    expect(campaign?.latestParticipants).toHaveLength(1);
    expect(campaign?.latestParticipants[0].handler).toBe(profile_2.handler);
  });

  test("should add another participant to the latest participants list of the campaign", async () => {
    // Join campaign on chain
    await joinCampaignOnChain(campaign.id, profile_3.handler);

    const data = await fetchGQL(JOIN_CAMPAIGN_MUTATION, {
      request: {
        campaignId: campaign.id,
        handler: profile_1.handler,
        participantHandler: profile_3.handler,
      },
    });
    const { status, error } = data?.joinCampaign;

    const dataCampaign = await fetchGQL(GET_CAMPAIGN_QUERY, {
      request: { id: campaign.id, handler: campaign.handler },
    });

    campaign = dataCampaign?.getCampaign?.campaign;

    expect(status).toBe("success");
    expect(error).toBeNull();
    expect(campaign?.latestParticipants).toHaveLength(2);
    expect(campaign?.latestParticipants[0].handler).toBe(profile_2.handler);
    expect(campaign?.latestParticipants[1].handler).toBe(profile_3.handler);
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
