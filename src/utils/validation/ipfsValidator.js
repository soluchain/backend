import axios from "axios";
import { makeError } from "../makeError.js";

const IPFS_PATH = "https://soluchain.infura-ipfs.io/ipfs/";

// Validate the IPFS uri and return the content object
// The uri should be in the format of:
// https://soluchain.infura-ipfs.io/ipfs/<hash>

export const ipfsUrlValidator = async (uri, entity) => {
  try {
    if (
      !uri ||
      !uri.startsWith(IPFS_PATH) ||
      !uri.replace(IPFS_PATH, "").match(/^[a-zA-Z0-9]+$/) ||
      uri.replace(IPFS_PATH, "").length !== 46
    ) {
      return makeError("InvalidIPFSUri");
    }

    // Get the content from the IPFS uri
    const { data: content } = await axios.get(uri);

    // Check if the content is valid
    if (!content) {
      return makeError("InvalidIPFSUri");
    }

    // Check if the content is valid
    if (entity === "profile") {
      if (
        !content.name ||
        !content.bio ||
        !content.avatar ||
        !content.image.startsWith(IPFS_PATH) ||
        !content.image.replace(IPFS_PATH, "").match(/^[a-zA-Z0-9]+$/) ||
        content.image.replace(IPFS_PATH, "").length !== 46
      ) {
        return makeError("InvalidData");
      }
    } else if (entity === "campaign") {
      if (
        !content.title ||
        !content.description ||
        !content.image ||
        !content.image.startsWith(IPFS_PATH) ||
        !content.image.replace(IPFS_PATH, "").match(/^[a-zA-Z0-9]+$/) ||
        content.image.replace(IPFS_PATH, "").length !== 46
      ) {
        return makeError("InvalidData");
      }
    } else {
      return makeError("InvalidData");
    }

    return {
      isValid: true,
      content,
    };
  } catch (error) {
    console.error(error);
    return makeError("InternalServerError");
  }
};
