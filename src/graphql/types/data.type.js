import gql from "graphql-tag";

export const dataType = gql`
  type DataResponse {
    status: String
    success: Boolean
    error: ErrorType
  }
`;
