const { gql } = require("graphql-request");
const { fetchGQL } = require("../../helpers/fetchGQL");
const { getValidHandlerRandom } = require("../../helpers/data-generator");
const { createProfileOnDB } = require("../../helpers/index.js");

const GET_PROFILES_QUERY = gql`
  query getProfiles($request: ProfilesQueryRequest!) {
    getProfiles(request: $request) {
      items {
        id
        handler
      }
      nextToken
      error {
        code
        message
      }
    }
  }
`;

describe("getProfiles", () => {
  // create 10 profiles
  beforeAll(async () => {
    const contentUri = "https://test.com";
    for (let i = 0; i < 10; i++) {
      const handler = getValidHandlerRandom();
      await createProfileOnDB(handler, contentUri);
    }
  });

  // test parameters limit, and orderBy
  test("should return profiles with limit, nextToken, and orderBy", async () => {
    const data = await fetchGQL(GET_PROFILES_QUERY, {
      request: { limit: 2, orderBy: "latest" },
    });

    const { items, nextToken, error } = data?.getProfiles;

    expect(items?.length).toBe(2);
    expect(nextToken).not.toBeNull();
    expect(error).toBeNull();
  });

  // test parameter nextToken
  test("should return profiles with nextToken", async () => {
    const data = await fetchGQL(GET_PROFILES_QUERY, {
      request: { limit: 2, orderBy: "latest" },
    });

    const { items, nextToken, error } = data?.getProfiles;

    const data2 = await fetchGQL(GET_PROFILES_QUERY, {
      request: { limit: 2, nextToken, orderBy: "latest" },
    });

    const { items: items2, error: error2 } = data2?.getProfiles;

    expect(items2?.length).toBe(2);
    expect(error2).toBeNull();
    expect(items2[0].id).not.toBe(items[0].id);
  });

  // test parameter orderBy
  // latest: sort by latest created profile
  // oldest: sort by oldest created profile
  test("should return profiles with orderBy", async () => {
    const data = await fetchGQL(GET_PROFILES_QUERY, {
      request: { limit: 2, orderBy: "latest" },
    });

    const { items, error } = data?.getProfiles;

    const data2 = await fetchGQL(GET_PROFILES_QUERY, {
      request: { limit: 2, orderBy: "oldest" },
    });

    const { items: items2, error: error2 } = data2?.getProfiles;

    expect(error).toBeNull();
    expect(error2).toBeNull();
    expect(items[0].id).not.toBe(items2[0].id);
  });
});
