import gql from "graphql-tag";

export const query = gql`
  type Query {
    # Profile
    getProfile(request: SingleProfileQueryRequest!): ProfileResponse
    getProfiles(request: ProfilesQueryInput!): ProfilesResponse

    # Campaign
    getCampaign(request: SingleCampaignQueryRequest!): CampaignResponse
    getCampaigns(request: CampaignsQueryInput!): CampaignsResponse
    getParticipants(
      request: CampaignParticipantsQueryRequest!
    ): CampaignParticipantsResponse
    getJoinedCampaigns(
      request: UserJoinedCampaignsQueryRequest!
    ): CampaignParticipantsResponse
  }
`;
