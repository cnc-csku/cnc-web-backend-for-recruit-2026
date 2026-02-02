import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./storage.client";

export class StorageService {
  constructor() { }

  async uploadObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ContentDisposition: "inline",
      }),
    );
    return params.key;
  }

  async presignGetObject(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });
    return getSignedUrl(s3Client, command, {
      expiresIn: params.expiresIn ?? 300,
    });
  }

  async deleteObject(params: { bucket: string; key: string }) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      }),
    );
  }
}
