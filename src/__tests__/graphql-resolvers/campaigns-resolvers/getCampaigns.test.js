const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const { createCampaignOnDB } = require("../../helpers/index.js");

const GET_CAMPAIGNS_QUERY = gql`
  query getCampaigns($request: CampaignsQueryInput!) {
    getCampaigns(request: $request) {
      items {
        id
        owner
        handler
        contentUri
        status
        featured
        createdAt
        updatedAt
      }
      nextToken
      error {
        code
        message
      }
    }
  }
`;

const lng = 36.85909745084703;
const lat = 30.79379946813151;

describe("getCampaigns", () => {
  // create 10 campaigns
  beforeAll(async () => {
    const contentUri =
      "https://soluchain.infura-ipfs.io/ipfs/QmS942X7HR8Sfr5vVNydfmz4d23pJmtZawmSnoGMpfcWwQ";
    for (let i = 0; i < 5; i++) {
      const handler = getValidHandlerRandom();
      await createCampaignOnDB(handler, contentUri);
    }
  });

  // test parameters limit, and orderBy
  test("should return campaigns with limit, and orderBy", async () => {
    const data = await fetchGQL(GET_CAMPAIGNS_QUERY, {
      request: { limit: 2, orderBy: "latest" },
    });

    const { items, nextToken, error } = data?.getCampaigns;

    expect(items?.length).toBe(2);
    expect(nextToken).not.toBeNull();
    expect(error).toBeNull();
  });

  // test parameter nextToken
  test("should return campaigns with nextToken", async () => {
    const data = await fetchGQL(GET_CAMPAIGNS_QUERY, {
      request: { limit: 2, orderBy: "latest" },
    });

    const { items, nextToken, error } = data?.getCampaigns;

    const data2 = await fetchGQL(GET_CAMPAIGNS_QUERY, {
      request: { limit: 2, nextToken, orderBy: "latest" },
    });

    const { items: items2, error: error2 } = data2?.getCampaigns;

    expect(items2?.length).toBe(2);
    expect(error2).toBeNull();
  });

  // test parameter location
  test("should return campaigns near a location", async () => {
    const data = await fetchGQL(GET_CAMPAIGNS_QUERY, {
      request: { location: { lat, lng } },
    });

    const { items, error } = data?.getCampaigns;

    expect(items?.length).not.toBe(0);
    expect(error).toBeNull();
  });
});
