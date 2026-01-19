import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../../core/config";
import {
  FileUploadError,
  FileSizeExceededError,
  InvalidFileTypeError,
  MinIOConnectionError,
} from "../../core/errors";

export type FileType = "profile" | "transcript";

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = config.minio.bucketName;

    // Initialize S3 client with MinIO configuration
    this.s3Client = new S3Client({
      endpoint: `http://${config.minio.endpoint}:${config.minio.port}`,
      region: config.minio.region,
      credentials: {
        accessKeyId: config.minio.rootUser,
        secretAccessKey: config.minio.rootPassword,
      },
      forcePathStyle: true, // Required for MinIO
    });

    // Test connection on initialization
    // We'll do a soft check - actual connection test happens on first upload
    console.log(`[StorageService] Initialized with endpoint: ${config.minio.endpoint}:${config.minio.port}, bucket: ${this.bucketName}`);
  }

  /**
   * Validates file type and returns allowed MIME types
   */
  private getAllowedMimeTypes(fileType: FileType): string[] {
    switch (fileType) {
      case "profile":
        return ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      case "transcript":
        return ["application/pdf"];
      default:
        return [];
    }
  }

  /**
   * Validates file MIME type
   */
  private validateMimeType(file: File, fileType: FileType): void {
    const allowedTypes = this.getAllowedMimeTypes(fileType);

    if (!allowedTypes.includes(file.type)) {
      throw new InvalidFileTypeError(
        `Invalid file type for ${fileType}. Expected: ${allowedTypes.join(", ")}, Got: ${file.type}`
      );
    }
  }

  /**
   * Validates file size
   */
  private validateFileSize(file: File, fileType: FileType): void {
    const maxSizeMB =
      fileType === "profile"
        ? config.fileUpload.maxProfileSizeMB
        : config.fileUpload.maxTranscriptSizeMB;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      throw new FileSizeExceededError(
        `File size exceeds maximum allowed for ${fileType}. Maximum: ${maxSizeMB}MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  /**
   * Generates a unique file key/path
   */
  private generateFileKey(
    fileType: FileType,
    candidateId: string,
    originalName: string
  ): string {
    // Extract file extension
    const extension = originalName.split(".").pop() || "";

    // Generate UUID for uniqueness (using timestamp + random for simplicity)
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create path: {fileType}s/{candidateId}/{uuid}-{originalName}
    return `${fileType}s/${candidateId}/${uniqueId}-${originalName}`;
  }

  /**
   * Uploads a file to MinIO
   */
  async uploadFile(
    file: File,
    fileType: FileType,
    candidateId: string
  ): Promise<UploadResult> {
    try {
      console.log(`[StorageService] Uploading ${fileType} for ${candidateId}: ${file.name} (${file.size} bytes, ${file.type})`);

      // Validate file type
      this.validateMimeType(file, fileType);

      // Validate file size
      this.validateFileSize(file, fileType);

      // Generate unique key
      const key = this.generateFileKey(fileType, candidateId, file.name);

      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();

      // Upload to MinIO
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          candidateId: candidateId,
          uploadDate: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Generate URL
      const url = `http://${config.minio.endpoint}:${config.minio.port}/${this.bucketName}/${key}`;

      console.log(`[StorageService] Upload successful: ${key}`);

      return {
        url,
        key,
        bucket: this.bucketName,
      };
    } catch (error) {
      if (
        error instanceof InvalidFileTypeError ||
        error instanceof FileSizeExceededError
      ) {
        throw error;
      }

      console.error("[StorageService] File upload error:", error);
      throw new FileUploadError(
        `Failed to upload ${fileType} file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Deletes a file from MinIO
   */
  async deleteFile(key: string): Promise<void> {
    try {
      console.log(`[StorageService] Deleting file: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      console.log(`[StorageService] File deleted successfully: ${key}`);
    } catch (error) {
      console.error("[StorageService] File deletion error:", error);
      throw new FileUploadError(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Extracts key from URL
   */
  extractKeyFromUrl(url: string): string {
    // URL format: http://endpoint:port/bucket/key
    const parts = url.split(`/${this.bucketName}/`);
    return parts[1] || "";
  }
}
