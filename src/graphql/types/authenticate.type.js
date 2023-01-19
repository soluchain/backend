import gql from "graphql-tag";

export const authenticateType = gql`
  type AuthenticateResponse {
    token: String
    error: errorType
  }

  input AuthenticateInput {
    signature: String!
  }
`;
