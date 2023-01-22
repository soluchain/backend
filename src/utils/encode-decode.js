// Description: This function encodes a nextToken object into a string
// Function name: encodeNextToken
// Variable name: nextToken
// Purpose: The nextToken object is used to pass information
export const encodeNextToken = (nextToken) => {
  if (!nextToken) return null;
  return Buffer.from(JSON.stringify(nextToken)).toString("base64");
};

export const decodeNextToken = (nextToken) => {
  if (!nextToken) return null;
  return JSON.parse(Buffer.from(nextToken, "base64").toString("ascii"));
};
