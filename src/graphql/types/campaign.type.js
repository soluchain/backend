import gql from "graphql-tag";

export const campaignType = gql`
  type LocationType {
    type: String
    coordinates: [[[Float]]]
  }

  type CampaignType {
    id: String
    owner: Address
    handler: String
    profile: ProfileType
    contentUri: String
    location: LocationType
    status: String
    featured: Boolean
    title: String
    purpose: String
    description: String
    image: String
    latestParticipants: [ProfileType]
    participantCount: Int
    createdAt: String
    updatedAt: String
  }

  type CampaignResponse {
    campaign: CampaignType
    error: ErrorType
  }

  type CampaignsResponse {
    items: [CampaignType]
    nextToken: String
    error: ErrorType
  }

  input LocationInput {
    lat: Float
    lng: Float
  }

  input CampaignsQueryRequest {
    owner: Address
    profile: String
    orderBy: String
    status: String
    featured: Boolean
    limit: Int
    nextToken: String
    location: LocationInput
  }

  input CreateCampaignInput {
    id: BigInt!
  }

  input JoinCampaignInput {
    campaignId: BigInt!
    handler: String!
    participantHandler: String!
  }

  input CampaignParticipantsQueryRequest {
    campaignId: BigInt!
    limit: Int
    nextToken: String
  }

  type CampaignParticipantType {
    campaign: CampaignType
    recipient: ProfileType
    profile: ProfileType
    createdAt: String
  }

  type CampaignParticipantsResponse {
    items: [CampaignParticipantType]
    nextToken: String
    error: ErrorType
  }

  input SingleCampaignQueryRequest {
    id: BigInt!
    handler: String!
  }

  input UserJoinedCampaignsQueryRequest {
    handler: String!
    limit: Int
    nextToken: String
  }
`;
