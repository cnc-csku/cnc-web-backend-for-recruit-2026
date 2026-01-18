import { randomUUIDv5, randomUUIDv7 } from "bun";
import { StorageController } from "../../core/storage/storage.controller";
import { CandidateController } from "./candidate.controller";
import { CandidateNotFoundError } from "../../core/errors";

export interface UploadResult {
  key: string;
  buckey: string;
  contentType: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PREFIX = "image/";
const BUCKET = "uploads";

export class CandidateUploadHandler {
  constructor(
    private storageController: StorageController,
    private candidateController: CandidateController,
  ) {}

  async profileUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "profile");
  }

  async transcriptUpload(file: File, candidateId: string) {
    return await this._upload(file, candidateId, "transcript");
  }

  private async _upload(
    file: File,
    candidateId: string,
    type: "profile" | "transcript",
  ): Promise<UploadResult> {
    if (!(await this.candidateController.getCandidate(candidateId)))
      throw new CandidateNotFoundError();

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
    return { buckey: BUCKET, contentType: file.type, key: resultKey };
  }
}
