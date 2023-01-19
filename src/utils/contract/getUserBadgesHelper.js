// Description: Helper function to get user badges from the smart contract

export const getUserBadgesHelper = async (contract, address) => {
  try {
    const badges = await contract.getUserBadges(address);
    return badges || [];
  } catch (error) {
    console.log("error", error);
    return [];
  }
};
