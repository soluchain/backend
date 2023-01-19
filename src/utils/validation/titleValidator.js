import { makeError } from "../makeError.js";

export const titleValidator = (title, minLength, maxLength) => {
  try {
    if (!title) {
      return { isValid: false, error: makeError("InvalidTitle").error };
    }
    if (title.length < minLength) {
      return {
        isValid: false,
        error: makeError("InvalidTitle").error,
      };
    }
    if (title.length > maxLength) {
      return {
        isValid: false,
        error: makeError("InvalidTitle").error,
      };
    }
    return { isValid: true };
  } catch (error) {
    console.log(error);
    return { isValid: false, error: makeError("InvalidTitle").error };
  }
};
