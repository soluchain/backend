const errors = {
  // Auth
  InvalidSignature: "Invalid signature",
  MismatchOwner: "Mismatch owner",

  // Generic
  InvalidContentUri: "Invalid content uri",
  InvalidParameters: "Invalid parameters",
  InternalServerError: "Internal server error",
  LimitTooLarge: "Limit too large",
  InvalidIPFSUri: "Invalid IPFS uri",
  InvalidTitle: "Invalid title",
  InvalidDescription: "Invalid description",
  InvalidData: "Invalid data",

  // Badge
  InsufficientBadge: "Insufficient badge",

  // Profile
  ProfileDoesNotExist: "Profile does not exist",
  ProfileAlreadyExists: "Profile already exists",

  // Campaign
  CampaignDoesNotExist: "Campaign does not exist",
  CampaignAlreadyExists: "Campaign already exists",
  CampaignIsNotAvailable: "Campaign is not available",
  CampaignCreationFailed: "Campaign creation failed",
  AreaTooLarge: "The selected area is too large for your badge",
  NotJoinedCampaignInProfileContract:
    "You have not joined this campaign in the profile smart contract",
  FailedToJoinCampaign: "Failed to join campaign",
};

export const makeError = (code) => {
  let message;

  if (errors[code]) {
    message = errors[code];
  } else {
    message = "An unexpected error has occurred";
  }

  return {
    error: {
      code,
      message,
    },
  };
};
