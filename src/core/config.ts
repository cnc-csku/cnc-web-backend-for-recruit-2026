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
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || 9000),
    rootUser: process.env.MINIO_ROOT_USER || "minioadmin",
    rootPassword: process.env.MINIO_ROOT_PASSWORD || "minioadmin123",
    bucketName: process.env.MINIO_BUCKET_NAME || "cnc-recruit-files",
    useSSL: process.env.MINIO_USE_SSL === "true",
    region: process.env.MINIO_REGION || "us-east-1",
  },
  fileUpload: {
    maxProfileSizeMB: Number(process.env.MAX_PROFILE_SIZE_MB || 5),
    maxTranscriptSizeMB: Number(process.env.MAX_TRANSCRIPT_SIZE_MB || 10),
  },
};

if (!config.mongo.uri) {
  throw new Error("MONGO_URI is required");
}
if (!config.minio.endpoint) {
  throw new Error("MINIO_ENDPOINT is required");
}
if (!config.minio.bucketName) {
  throw new Error("MINIO_BUCKET_NAME is required");
}
