const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const dotenv = require("dotenv");
const { createCampaignOnDB } = require("../../helpers/campaign-onchain.js");
const { signer } = require("../../helpers/walletConnector.js");

dotenv.config();

const CREATE_CAMPAIGN_MUTATION = gql`
  mutation createCampaign($request: CreateCampaignInput!) {
    createCampaign(request: $request) {
      campaign {
        id
        handler
        contentUri
        owner
      }
      error {
        code
        message
      }
    }
  }
`;

const too_long_title_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmUdQcxABt892K38CQnFmepp3cK8zZQ4yNWE6NRLHs3qau";

const too_short_title_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmRdi6PqLg5UdLJJkRMTzEgGjGoVLktUCS5h6mSZaf5Yxg";

const invalid_description_with_invalid_tags_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmWRR2XLr7N4bpsaXDmXeNb5ytuqzMJNeMeiNHgQ9JTbUe";

const too_long_description_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmXKJdFj1rMGRHiQLcP9MpwHgZdrPUqhVrJpyXQB71R5H1";

const big_area_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmRR26UsG2ceUwocdh6DaDtxSKiTg2AwAhhtxp2KttTBHu";

const not_provided_location_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/Qmey6Twf6B3CwRZ9n8EKTu3BZb1sTecyesZrpSMFPw6DCb";

const valid_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmS942X7HR8Sfr5vVNydfmz4d23pJmtZawmSnoGMpfcWwQ";

describe("createCampaign", () => {
  test("should revert if campaign is NOT created on-chain", async () => {
    const data = await fetchGQL(CREATE_CAMPAIGN_MUTATION, {
      request: {
        id: "1000000000000000000000000000000000000000000000000000000000000000",
      },
    });

    expect(data?.createCampaign?.campaign).toBeNull();
    expect(data?.createCampaign?.error?.code).toBe("CampaignDoesNotExist");
  });

  test("should revert if location is not provided", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = not_provided_location_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("CampaignAreaExceedsLimit");
  });

  test("should revert if location area is larger than badge limitation", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = big_area_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("CampaignAreaExceedsLimit");
  });

  test("should revert if title is not valid", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = too_short_title_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("InvalidTitle");
  });

  test("should revert if title is too long", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = too_long_title_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("InvalidTitle");
  });

  test("should revert if description is not valid", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = invalid_description_with_invalid_tags_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("InvalidDescription");
  });

  test("should revert if description is too long", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = too_long_description_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("InvalidDescription");
  });

  test("should revert if contentUri is not valid", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = "https://soluchain.infura-ipfs.io/ipfs/invalid";

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign).toBeNull();
    expect(error?.code).toBe("InvalidContentUri");
  });

  test("should create a new campaign", async () => {
    const handler = getValidHandlerRandom();
    const contentUri = valid_content_uri;

    const { campaign, error } = await createCampaignOnDB(handler, contentUri);

    expect(campaign?.owner).toBe(signer.address);
    expect(campaign?.handler).toBe(handler);
    expect(campaign?.contentUri).toBe(contentUri);
  });
});
