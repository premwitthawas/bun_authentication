import { Elysia } from "elysia";
import { verifyAccessToken } from "../utils/jwtHelper";
import { prisma } from "../utils/prisma";

export const isAuthenticated = (app: Elysia) => {
  return app.derive(async ({ set, cookie: { accessToken, refreshToken } }) => {
    const cookieValue = accessToken.value;
    if (!cookieValue) {
      set.status = 401;
      return {
        status: 401,
        message: "Token not provided",
      };
    }
    const { email }: any = verifyAccessToken(cookieValue);
    if (!email) {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        name: true,
        Role: true,
      },
    });
    if (!user) {
      return {
        status: 401,
        message: "User not found",
      };
    }
    return {
      user,
    };
  });
};
