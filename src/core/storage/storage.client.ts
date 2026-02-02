import { Client } from "minio";
import { config } from "../config";

const endpointUrl = new URL(config.s3.endpoint!);
const useSSL = config.s3.useSSL;
const port = endpointUrl.port
  ? Number(endpointUrl.port)
  : useSSL
    ? 443
    : 80;

export const minio = new Client({
  endPoint: endpointUrl.hostname,
  port,
  region: "us-east-1",
  accessKey: config.s3.accessKey!!,
  secretKey: config.s3.secretKey!!,
  useSSL,
  pathStyle: true,
});
