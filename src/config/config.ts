export const APP_CONFIG = {
  host: Bun.env.APP_HOST as string,
  port: Number(Bun.env.APP_PORT as string),
  version: Bun.env.APP_VERSION as string,
  jwtAccessSecret: Bun.env.JWT_ACCESS_SECRET as string,
  jwtAccessExpires: Bun.env.JWT_ACCESS_EXPIRES as string,
  jwtRefreshSecret: Bun.env.JWT_REFRESH_SECRET as string,
  jwtRefreshExpires: Bun.env.JWT_REFRESH_EXPIRES as string,
};
export const DB_CONFIG = {
  host: Bun.env.POSTGRES_HOST as string,
  port: Number(Bun.env.POSTGRES_PORT as string),
  username: Bun.env.POSTGRES_USER as string,
  password: Bun.env.POSTGRES_PASSWORD as string,
  database: Bun.env.POSTGRES_DB as string,
};
