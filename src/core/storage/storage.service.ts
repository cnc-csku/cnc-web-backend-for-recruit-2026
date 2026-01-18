import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "./storage.client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageService {
  constructor() {}

  async uploadObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }) {
    await s3.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );

    return params.key;
  }

  async presignGetObject(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
  }) {
    return getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      }),
      { expiresIn: params.expiresIn ?? 300 },
    );
  }

  async deleteObject(params: { bucket: string; key: string }) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
      }),
    );
  }
}
