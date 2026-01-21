import { randomUUIDv7 } from "bun";
import { StorageController } from "../../core/storage/storage.controller";
import { FileTooLargeError, InvalidFileTypeError } from "../../core/errors";

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
    type: "profile" | "transcript",
  ): Promise<UploadResult> {
    // Profile only allows images, transcript allows images and PDFs
    const allowedPrefix =
      type === "transcript" ? ["image/", "application/pdf"] : "image/";

    const isValidType = Array.isArray(allowedPrefix)
      ? allowedPrefix.some((prefix) => file.type.startsWith(prefix))
      : file.type.startsWith(allowedPrefix);

    if (!isValidType) {
      throw new InvalidFileTypeError();
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeError();
    }
    console.log(file.name);
    console.log(file.type);

    const ext = file.type.split("/")[1];
    const key = `candidates/${candidateId}/${type}/${randomUUIDv7()}.${ext}`;
    const resultKey = await this.storageController.uploadFile({
      bucket: BUCKET,
      key: key,
      file,
    });

    return { bucket: BUCKET, contentType: file.type, key: resultKey };
  }

  private async _delete(key: string) {
    await this.storageController.deleteFile({
      bucket: BUCKET,
      key: key,
    });
  }
}
