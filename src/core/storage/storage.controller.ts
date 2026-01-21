import { StorageService } from "./storage.service";

export class StorageController {
  constructor(private service: StorageService) {}

  async uploadFile(params: { bucket: string; key: string; file: File }) {
    const buffer = Buffer.from(await params.file.arrayBuffer());
    return await this.service.uploadObject({
      ...params,
      body: buffer,
      contentType: params.file.type,
    });
  }

  async getPresignedFileUrl(params: {
    bucket: string;
    key: string;
    expiresIn?: number;
  }) {
    return await this.service.presignGetObject(params);
  }

  async getFileUrl(params: { bucket: string; key: string }) {
    return `${process.env.S3_ENDPOINT}/${params.bucket}/${params.key}`;
  }

  async deleteFile(params: { bucket: string; key: string }) {
    return await this.service.deleteObject(params);
  }
}
