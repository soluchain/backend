const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const { createCampaignOnDB } = require("../../helpers/index.js");

const GET_CAMPAIGN_QUERY = gql`
  query getCampaign($request: SingleCampaignQueryRequest!) {
    getCampaign(request: $request) {
      campaign {
        id
        owner
        handler
        title
        description
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

describe("getCampaign", () => {
  // create 1 campaigns

  let handler = getValidHandlerRandom();
  let createdCampaign;

  beforeAll(async () => {
    const contentUri =
      "https://soluchain.infura-ipfs.io/ipfs/QmTPi2ZWWXJnobsfmuqmgefN2w2ffSykyue3KcJsCrRtEP";
    const res = await createCampaignOnDB(handler, contentUri);
    createdCampaign = res?.campaign;
  });

  // get campaign by id
  test("should return campaign by id", async () => {
    const data = await fetchGQL(GET_CAMPAIGN_QUERY, {
      request: { id: createdCampaign.id, handler },
    });

    const { campaign, error } = data?.getCampaign;

    expect(campaign?.id).toBe(createdCampaign.id);
    expect(campaign?.handler).toBe(createdCampaign.handler);
    expect(campaign?.contentUri).toBe(createdCampaign.contentUri);
    expect(campaign?.title).toBe(createdCampaign.title);
    expect(campaign?.description).toBe(createdCampaign.description);
    expect(campaign?.status).toBe("active");
    expect(error).toBeNull();
  });

  // return error if campaign not found
  test("should return error if campaign not found", async () => {
    const data = await fetchGQL(GET_CAMPAIGN_QUERY, {
      request: { id: "not-found", handler },
    });

    const { campaign, error } = data?.getCampaign;

    expect(campaign).toBeNull();
    expect(error?.code).toBe("CampaignDoesNotExist");
  });
});
