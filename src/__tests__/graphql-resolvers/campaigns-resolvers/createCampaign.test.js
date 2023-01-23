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

const not_provided_location_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/Qmet8DsfXQ9C66tt9QV7a3jDfrry6GJAXHX95dimsqruYF";

const big_area_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmdAfRxprKSusoiDAtg5a4PmpZwKyXwRe4fSPtExUyJj3G";

const too_short_title_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmRPjRyWXa7Aq4cthGnnAPw9GWExzhyvN5coUpAGLwzW9r";

const too_long_title_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmRJtc696ym19t3M3CMHNfqgkBtZR1QxxWQ7J7SsbwobQ9";

const invalid_description_with_invalid_tags_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmSFKpHodPS6zXbSgdjh7paEMzHHZpv9M8YrERes48JYpd";

const too_long_description_content_uri =
  "https://soluchain.infura-ipfs.io/ipfs/QmfVAYaf3Wb9Fs7zoLdWu3WL8y7Vd7VZK5z96LXvaHqxZi";

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
    expect(error?.code).toBe("InvalidIPFSUri");
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
