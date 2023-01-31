import gql from "graphql-tag";

export const authenticateType = gql`
  type AuthenticateResponse {
    token: String
    error: ErrorType
  }

  input AuthenticateInput {
    signature: String!
  }
`;
