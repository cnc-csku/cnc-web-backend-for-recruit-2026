import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../config";

export const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: "us-east-1", // Region is often required but can be dummy for MinIO/compatible
  credentials: {
    accessKeyId: config.s3.accessKey!,
    secretAccessKey: config.s3.secretKey!,
  },
  forcePathStyle: true,
});
