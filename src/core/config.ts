import { logger } from "./logger";

type NodeEnv = "development" | "production";

const NODE_ENV = (process.env.NODE_ENV || "development") as NodeEnv;

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
  },
  env: NODE_ENV,
  isDev: NODE_ENV === "development",
  isProd: NODE_ENV === "production",
  hostname: NODE_ENV === "production" ? "0.0.0.0" : null,
};

if (!config.mongo.uri) {
  logger.error("MONGO_URI is required");
}
