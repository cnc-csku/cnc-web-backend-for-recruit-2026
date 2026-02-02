import { logger } from "./logger";

type NodeEnv = "development" | "production";

const NODE_ENV = (process.env.NODE_ENV || "development") as NodeEnv;

const REQUIRED_KEY = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
};

for (const [key, value] of Object.entries(REQUIRED_KEY)) {
  if (!value) {
    logger.error(`${key} is missing from .env`);
    throw new Error("Missing config");
  }
}

export const config = {
  port: Number(process.env.ELYSIA_PORT || 4000),
  authSecret: process.env.NEXTAUTH_SECRET,

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017?replicaSet=rs0",
    dbName: process.env.MONGO_DB_NAME || "cnc-recruit-2026",
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET_NAME,
    useSSL: process.env.S3_USE_SSL === "true",
  },
  env: NODE_ENV,
  isDev: NODE_ENV === "development",
  isProd: NODE_ENV === "production",
  hostname: NODE_ENV === "production" ? "0.0.0.0" : null,
};
