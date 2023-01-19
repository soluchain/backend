const { GraphQLClient } = require("graphql-request");
const dotenv = require("dotenv");

dotenv.config();

const fetchGQL = async (query, variables) => {
  const graphQLClient = new GraphQLClient(
    process.env.GRAPHQL_ENDPOINT_LOCAL_TEST
  );
  const data = await graphQLClient.request(query, variables);

  return data;
};

module.exports = {
  fetchGQL,
};
