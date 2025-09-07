import jwt from "jsonwebtoken";

export const genToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not defined in env");
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};