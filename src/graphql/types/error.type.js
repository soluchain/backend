import gql from "graphql-tag";

export const errorType = gql`
  type ErrorType {
    code: String
    message: String
  }
`;
