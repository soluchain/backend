const { GraphQLClient } = require("graphql-request");
const dotenv = require("dotenv");

dotenv.config();

const fetchGQL = async (query, variables, headers) => {
  try {
    const graphQLClient = new GraphQLClient(
      process.env.GRAPHQL_ENDPOINT_LOCAL_TEST,
      {
        headers,
      }
    );
    const data = await graphQLClient.request(query, variables);

    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  fetchGQL,
};
