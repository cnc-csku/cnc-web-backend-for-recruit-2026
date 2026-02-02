import { config } from "../config";
import { StorageService } from "./storage.service";

export class StorageController {
  constructor(private service: StorageService) { }

  async uploadFile(params: { bucket: string; key: string; file: File }) {
    const buffer = Buffer.from(await params.file.arrayBuffer());
    await this.service.uploadObject({
      bucket: config.s3.bucket!,
      key: `${params.bucket}/${params.key}`,
      body: buffer,
      contentType: params.file.type,
    });
    return params.key;
  }

  async getPresignedFileUrl(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
  }) {
    return await this.service.presignGetObject({
      bucket: config.s3.bucket!,
      key: `${params.bucket}/${params.key}`,
      expiresIn: params.expiresIn,
    });
  }

  getFileUrl(params: { bucket: string; key: string }) {
    return `${config.s3.endpoint}/${config.s3.bucket!}/${params.bucket}/${params.key}`;
  }

  async deleteFile(params: { bucket: string; key: string }) {
    return await this.service.deleteObject({
      bucket: config.s3.bucket!,
      key: `${params.bucket}/${params.key}`,
    });
  }
}
