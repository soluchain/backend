import gql from "graphql-tag";

export const profileType = gql`
  type PrivateProfileResponse {
    id: BigInt
    owner: Address
    handler: String
    contentUri: String
    status: String
    featured: Boolean
    createdAt: BigInt
    updatedAt: BigInt

    token: String
  }

  type ProfileType {
    id: BigInt
    owner: Address
    handler: String
    image: String
    bio: String
    contentUri: String
    status: String
    featured: Boolean
    createdAt: BigInt
    updatedAt: BigInt
  }

  type ProfileResponse {
    profile: ProfileType
    error: errorType
  }

  type ProfilesResponse {
    items: [ProfileType]
    nextToken: String
    error: errorType
  }

  input SingleProfileQueryRequest {
    handler: String
  }

  input ProfilesQueryInput {
    owner: Address
    featured: Boolean
    orderBy: String
    limit: Int
    nextToken: String
  }

  input CreateProfileInput {
    handler: String!
  }
`;
