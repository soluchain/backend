import gql from "graphql-tag";

export const query = gql`
  type Query {
    # Profile
    getProfile(request: SingleProfileQueryRequest!): ProfileResponse
    getProfiles(request: ProfilesQueryRequest!): ProfilesResponse

    # Campaign
    getCampaign(request: SingleCampaignQueryRequest!): CampaignResponse
    getCampaigns(request: CampaignsQueryRequest!): CampaignsResponse
    getParticipants(
      request: CampaignParticipantsQueryRequest!
    ): CampaignParticipantsResponse
    getJoinedCampaigns(
      request: UserJoinedCampaignsQueryRequest!
    ): CampaignParticipantsResponse
  }
`;
