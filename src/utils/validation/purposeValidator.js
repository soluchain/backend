import { makeError } from "../makeError.js";

export const purposeValidator = (purpose, minLength, maxLength) => {
  try {
    if (!purpose) {
      return { isValid: false, error: makeError("InvalidPurpose").error };
    }
    if (purpose.length < minLength) {
      return {
        isValid: false,
        error: makeError("InvalidPurpose").error,
      };
    }
    if (purpose.length > maxLength) {
      return {
        isValid: false,
        error: makeError("InvalidPurpose").error,
      };
    }
    return { isValid: true };
  } catch (error) {
    console.log(error);
    return { isValid: false, error: makeError("InvalidPurpose").error };
  }
};
