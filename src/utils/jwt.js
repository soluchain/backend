import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { AUTH_JWT_SECRET } = process.env;

export const genetateJWT = (payload) => {
  return jwt.sign(payload, AUTH_JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, AUTH_JWT_SECRET);
  } catch (error) {
    return null;
  }
};
