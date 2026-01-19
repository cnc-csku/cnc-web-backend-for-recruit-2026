import { StorageService, FileType, UploadResult } from "./storage.service";

export class StorageController {
  constructor(private storageService: StorageService) {}

  async uploadFile(
    file: File,
    fileType: FileType,
    candidateId: string
  ): Promise<UploadResult> {
    return await this.storageService.uploadFile(file, fileType, candidateId);
  }

  async deleteFile(key: string): Promise<void> {
    return await this.storageService.deleteFile(key);
  }

  extractKeyFromUrl(url: string): string {
    return this.storageService.extractKeyFromUrl(url);
  }
}
