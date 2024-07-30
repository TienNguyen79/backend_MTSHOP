import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";

export function generateAccessToken(payload) {
  const signOption = {
    expiresIn: "3d",
    algorithm: "RS256",
  };

  payload = { ...payload, type: "access_token" };
  let accessToken = jwt.sign(payload, configs.key.private, signOption);
  return accessToken;
}

export function generateRefreshToken(id) {
  const signOption = {
    expiresIn: "365d",
    algorithm: "RS256",
  };

  let payload = { type: "refresh_token", id };
  let refreshToken = jwt.sign(payload, configs.key.private, signOption);
  return refreshToken;
}
