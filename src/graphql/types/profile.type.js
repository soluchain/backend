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
    error: ErrorType
  }

  type ProfilesResponse {
    items: [ProfileType]
    nextToken: String
    error: ErrorType
  }

  input SingleProfileQueryRequest {
    handler: String
  }

  input ProfilesQueryRequest {
    owner: Address
    featured: Boolean
    orderBy: String
    limit: Int
    nextToken: String
  }

  input CreateProfileInput {
    handler: String!
  }

  input VerifyWhitelistInput {
    handler: String!
    tweetUrl: String!
  }
`;
