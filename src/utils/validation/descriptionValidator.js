import { makeError } from "../makeError.js";
import { limits } from "../../config/index.js";
import sanitizeHtml from "sanitize-html";

export const descriptionValidator = (value, minLength, maxLength) => {
  if (!value) {
    return { isValid: false, error: makeError("InvalidDescription").error };
  }

  // Check minimum length
  if (value.length < minLength) {
    return {
      isValid: false,
      error: makeError("InvalidDescription").error,
    };
  }

  // Check maximum length
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: makeError("InvalidDescription").error,
    };
  }
  // check invalid html tags or simple text
  const allowedTags = limits.ALLOWED_TAGS;

  const sanitizedDescription = sanitizeHtml(value, {
    allowedTags,
  });
  if (value !== sanitizedDescription) {
    return {
      isValid: false,
      error: makeError("InvalidDescription").error,
    };
  }

  return { isValid: true };
};
