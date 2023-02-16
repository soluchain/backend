import gql from "graphql-tag";

export const mutation = gql`
  type Mutation {
    # Authentication
    authenticate(request: AuthenticateInput!): AuthenticateResponse

    # Profile
    verifyWhitelist(request: VerifyWhitelistInput!): DataResponse
    createProfile(request: CreateProfileInput!): ProfileResponse
    setDefaultProfile(request: SetDefaultProfileInput!): DataResponse

    # Campaign
    createCampaign(request: CreateCampaignInput!): CampaignResponse
    joinCampaign(request: JoinCampaignInput!): DataResponse
  }
`;
