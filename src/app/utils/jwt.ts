import jwt, { type SignOptions } from "jsonwebtoken";

export const generateToken = (
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};
