import jwt from "jsonwebtoken";
import { APP_CONFIG } from "../config/config";

export const generateAccessToken = (payload: string | object) => {
  return jwt.sign(payload, APP_CONFIG.jwtAccessSecret, {
    expiresIn: APP_CONFIG.jwtAccessExpires,
  });
};

export const generateRefreshToken = (payload: string | object) => {
  return jwt.sign(payload, APP_CONFIG.jwtRefreshSecret, {
    expiresIn: APP_CONFIG.jwtRefreshExpires,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, APP_CONFIG.jwtAccessSecret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, APP_CONFIG.jwtRefreshSecret);
};
