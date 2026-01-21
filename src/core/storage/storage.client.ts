import { Client } from "minio";
import { config } from "../config";

const endpointUrl = new URL(config.s3.endpoint!);

export const minio = new Client({
  endPoint: endpointUrl.hostname,
  port: Number(endpointUrl.port),
  region: "us-east-1",
  accessKey: config.s3.accessKey!!,
  secretKey: config.s3.secretKey!!,
  useSSL: false,
  pathStyle: true,
});
