import gql from "graphql-tag";

export const errorType = gql`
  type errorType {
    code: String
    message: String
  }
`;
