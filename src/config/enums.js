export const enums = {
  // Profile
  PROFILE_STATUS: {
    ACTIVE: "active",
    BANNED: "banned",
    PENDING: "pending",
    DELETED: "deleted",
  },
  PROFILE_STATUS_MONGODB: ["active", "banned", "pending", "deleted"],

  // Campaign
  CAMPAIGN_STATUS: {
    ACTIVE: "active",
    BANNED: "banned",
    PENDING: "pending",
    DELETED: "deleted",
  },
  CAMPAIGN_STATUS_MONGODB: ["active", "banned", "pending", "deleted"],

  // Notification
  NOTIFICATION_TYPE: {
    JOIN_CAMPAIGN: "join-campaign",
    FOLLOW_PROFILE: "follow-profile",
  },
};
