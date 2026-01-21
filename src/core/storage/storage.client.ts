import { Client } from "minio";

const endpointUrl = new URL(process.env.S3_ENDPOINT!);

export const minio = new Client({
  endPoint: endpointUrl.hostname,
  port: Number(endpointUrl.port),
  region: "us-east-1",
  accessKey: process.env.S3_ACCESS_KEY!,
  secretKey: process.env.S3_SECRET_KEY!,
  useSSL: false,
});
