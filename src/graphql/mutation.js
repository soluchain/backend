import gql from "graphql-tag";

export const mutation = gql`
  type Mutation {
    # Authentication
    authenticate(request: AuthenticateInput!): AuthenticateResponse

    # Profile
    createProfile(request: CreateProfileInput!): ProfileResponse

    # Campaign
    createCampaign(request: CreateCampaignInput!): CampaignResponse
    joinCampaign(request: JoinCampaignInput!): DataResponse
  }
`;
