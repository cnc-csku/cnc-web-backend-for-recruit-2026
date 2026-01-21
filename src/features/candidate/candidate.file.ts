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
const PROFILE_BUCKET = "cnc-profile";
const TRANSCRIPT_BUCKET = "cnc-transcript";

export class CandidateFileHandler {
  constructor(private storageController: StorageController) {}

  async getPresignedUrl(key: string) {
    return this.storageController.getPresignedFileUrl({
      bucket: TRANSCRIPT_BUCKET,
      key: key,
    });
  }

  async getUrl(key: string) {
    return this.storageController.getFileUrl({
      bucket: PROFILE_BUCKET,
      key: key,
    });
  }

  async profileUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "profile");
  }

  async transcriptUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "transcript");
  }

  async unlink(key: string, type: "profile" | "transcript") {
    return await this._delete(key, type);
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

    const ext = file.type.split("/")[1];
    const key = `candidates/${candidateId}/${randomUUIDv7()}.${ext}`;
    const targetBucket =
      type === "profile" ? PROFILE_BUCKET : TRANSCRIPT_BUCKET;
    const resultKey = await this.storageController.uploadFile({
      bucket: targetBucket,
      key: key,
      file,
    });

    return { bucket: targetBucket, contentType: file.type, key: resultKey };
  }

  private async _delete(key: string, type: "profile" | "transcript") {
    const targetBucket =
      type === "profile" ? PROFILE_BUCKET : TRANSCRIPT_BUCKET;
    await this.storageController.deleteFile({
      bucket: targetBucket,
      key: key,
    });
  }
}
