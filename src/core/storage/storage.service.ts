import { minio } from "./storage.client";

export class StorageService {
  constructor() {}

  async uploadObject(params: {
    bucket: string;
    key: string;
    body: Buffer;
    contentType: string;
  }) {
    await minio.putObject(
      params.bucket,
      params.key,
      params.body,
      params.body.length,
      {
        "Content-Type": params.contentType,
        "Content-Disposition": "inline",
      },
    );
    return params.key;
  }

  async presignGetObject(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
  }) {
    return minio.presignedGetObject(
      params.bucket,
      params.key,
      params.expiresIn ?? 300,
    );
  }

  async deleteObject(params: { bucket: string; key: string }) {
    await minio.removeObject(params.bucket, params.key);
  }
}
