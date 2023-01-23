const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const {
  createCampaignOnDB,
  createProfileOnDB,
  joinCampaignOnDB,
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

const GET_JOINED_CAMPAIGNS_QUERY = gql`
  query getJoinedCampaigns($request: UserJoinedCampaignsQueryRequest!) {
    getJoinedCampaigns(request: $request) {
      items {
        campaign {
          id
          handler
          title
          image
        }
        recipient {
          id
          handler
          image
          bio
        }
        profile {
          id
          handler
          image
          bio
        }
        createdAt
      }
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

describe("getJoinedCampaigns", () => {
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

    // Join campaign on db (including on chain)
    await joinCampaignOnDB(campaign.id, profile_1.handler, profile_2.handler);
  });

  test("should return the participants of a campaign", async () => {
    const res = await fetchGQL(GET_JOINED_CAMPAIGNS_QUERY, {
      request: { handler: profile_2.handler, limit: 10 },
    });

    const { items, error } = res?.getJoinedCampaigns;

    expect(error).toBeNull();
    expect(items).toHaveLength(1);
    expect(items[0].campaign.id).toEqual(campaign.id);
    expect(items[0].campaign.handler).toEqual(campaign.handler);
    expect(items[0].campaign.title).toEqual(campaign.title);
    expect(items[0].campaign.image).toEqual(campaign.image);
  });
});
