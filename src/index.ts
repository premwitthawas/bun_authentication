import { Elysia, t } from "elysia";
import { APP_CONFIG } from "./config/config";
import { helmet } from "elysia-helmet";
import { pluginGracefulServer } from "graceful-server-elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./utils/prisma";

import * as bcrypt from "bcryptjs";
import { errorValidation } from "./utils/errorValidation";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./utils/jwtHelper";
import { isAuthenticated } from "./middlewares/authentication";

const port = APP_CONFIG.port || 3000;
const urlApi = `/api/${APP_CONFIG.version}`;
const app = new Elysia();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
  })
);
app.use(pluginGracefulServer());

app.get("/", () => "Hello Elysia");

app.post(
  urlApi + "/register",
  async ({ body, set }) => {
    const { email, name, password } = body;
    try {
      const passwordHashed = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          password: passwordHashed,
        },
      });
      set.status = 201;
      return {
        status: 201,
        message: "User created",
      };
    } catch (error) {
      errorValidation(error, set);
    }
  },
  {
    body: t.Object({
      name: t.String(),
      password: t.String(),
      email: t.String(),
    }),
  }
);

app.post(
  urlApi + "/login",
  async ({ body, set, cookie: { accessToken, refreshToken } }) => {
    const { email, password } = body;
    try {
      const userExisting = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userExisting) {
        set.status = 401;
        return {
          status: 401,
          message: "User not found",
        };
      }

      const passwordMatch = await bcrypt.compare(
        password,
        userExisting.password
      );

      if (!passwordMatch) {
        set.status = 401;
        return {
          status: 401,
          message: "Invalid password",
        };
      }
      const userData = {
        userId: userExisting.id,
        email: userExisting.email,
        name: userExisting.name,
        role: userExisting.Role,
      };
      set.status = 200;
      accessToken.set({
        value: generateAccessToken(userData),
        httpOnly: true,
        maxAge: 60 * 60,
      });
      refreshToken.set({
        value: generateRefreshToken(userData),
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1,
      });
      return {
        status: 200,
        message: "Logged in",
      };
    } catch (error) {
      errorValidation(error, set);
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);

app.post(
  urlApi + "/logout",
  async ({ set, cookie: { accessToken, refreshToken } }) => {
    try {
      accessToken.remove();
      refreshToken.remove();
      return {
        status: 200,
        message: "Logged out",
      };
    } catch (error) {
      errorValidation(error, set);
    }
  }
);

app.get(
  urlApi + "/refresh-token",
  async ({ cookie: { accessToken, refreshToken }, set }) => {
    const refreshTokenValue = refreshToken.value;
    try {
      if (!refreshTokenValue) {
        set.status = 401;
        return {
          status: 401,
          message: "refresh token not provided",
        };
      }
      const { userId, email, role, name }: any =
        verifyRefreshToken(refreshTokenValue);
      const newAccessToken = generateAccessToken({
        userId,
        email,
        name,
        role,
      });
      accessToken.set({
        value: newAccessToken,
        httpOnly: true,
        maxAge: 60 * 60,
      });
      set.status = 200;
      return {
        status: 200,
        message: "Token refreshed",
      };
    } catch (error) {
      return {
        status: 401,
        message: "Unauthorized",
      };
    }
  }
);

app.use(isAuthenticated).get(urlApi + "/me", async ({ user }) => {
  try {
    return {
      status: 200,
      user,
    };
  } catch (error) {
    return {
      status: 400,
      message: error,
    };
  }
});

app.listen(port, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
