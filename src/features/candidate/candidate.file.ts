import { randomUUIDv7 } from "bun";
import { StorageController } from "../../core/storage/storage.controller";

export interface UploadResult {
  key: string;
  bucket: string;
  contentType: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PREFIX = "image/";
const BUCKET = "uploads";

export class CandidateFileHandler {
  constructor(private storageController: StorageController) {}

  async getPresignedUrl(key: string) {
    return this.storageController.getFileUrl({ bucket: BUCKET, key: key });
  }
  async profileUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "profile");
  }

  async transcriptUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "transcript");
  }

  async unlink(key: string) {
    return await this._delete(key);
  }

  private async _upload(
    file: File,
    candidateId: string,
    type: "profile" | "transcript"
  ): Promise<UploadResult> {
    if (!file.type.startsWith(ALLOWED_PREFIX)) {
      throw new Error("Invalid resume file type");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large");
    }

    const ext = file.type.split("/")[1];
    const key = `candidates/${candidateId}/${type}/${randomUUIDv7()}.${ext}`;
    const resultKey = await this.storageController.uploadFile({
      bucket: BUCKET,
      key: key,
      file,
    });
    console.log(resultKey);

    return { bucket: BUCKET, contentType: file.type, key: resultKey };
  }

  private async _delete(key: string) {
    await this.storageController.deleteFile({
      bucket: BUCKET,
      key: key,
    });
  }
}
