import { logger } from "./logger";

type NodeEnv = "development" | "production";

const NODE_ENV = (process.env.NODE_ENV || "development") as NodeEnv;

export const config = {
  env: NODE_ENV,
  isDev: NODE_ENV === "development",
  isProd: NODE_ENV === "production",

  port: Number(process.env.ELYSIA_PORT || 4000),
  hostname: NODE_ENV === "production" ? "0.0.0.0" : null,
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017?replicaSet=rs0",
    dbName: process.env.MONGO_DB_NAME || "cnc-recruit-2026",
  },
};

if (!config.mongo.uri) {
  logger.error("MONGO_URI is required");
}
