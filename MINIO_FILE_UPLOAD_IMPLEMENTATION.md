# MinIO File Upload Implementation - Status & Limitations

## Implementation Date
2025-01-19

## Overview
Self-hosted MinIO object storage for candidate profile images and transcript PDF uploads via multipart/form-data on the `/candidates/submit` endpoint.

---

## ✅ What Works

### Core Functionality
- [x] MinIO container running in Docker Compose (dev & prod)
- [x] Automatic bucket creation on startup via `minio-init` container
- [x] File upload via multipart/form-data in single POST request
- [x] Profile image upload (JPEG, PNG, WebP formats)
- [x] Transcript PDF upload
- [x] File size validation (5MB max for profile, 10MB max for transcript)
- [x] File MIME type validation
- [x] Unique file naming with timestamp-based UUIDs
- [x] File URLs stored in MongoDB candidate documents
- [x] Error handling with appropriate HTTP status codes
- [x] OpenAPI documentation updated

### Infrastructure
- [x] MinIO API accessible on port 9000
- [x] MinIO Console accessible on port 9001
- [x] Persistent volume for file storage (`minio-data`)
- [x] Environment-based configuration (dev uses localhost, prod uses minio hostname)
- [x] Health checks for MinIO container

### Code Architecture
- [x] Separate `StorageService` for MinIO operations
- [x] `StorageController` following existing patterns
- [x] Proper dependency injection via `src/lib/controllers.ts`
- [x] New domain-specific error classes
- [x] Comprehensive logging in StorageService

### Validation Layers
- [x] Elysia schema validation (type checking)
- [x] MIME type validation in StorageService
- [x] File size validation in StorageService
- [x] Duplicate candidate email check before upload

---

## ❌ What Doesn't Work (Known Limitations)

### File Cleanup
- [ ] **No automatic file deletion**: When a candidate is deleted, their uploaded files remain in MinIO
- [ ] **No cleanup on upload failure**: If candidate creation fails after file upload, orphaned files remain in MinIO
- [ ] **No file update functionality**: Cannot replace existing files without manual intervention
- [ ] **No bulk delete operations**: Deleting multiple candidates won't clean up files

### File Management
- [ ] **No file expiration**: Files are stored indefinitely
- [ ] **No thumbnail generation**: Large images are served at full resolution
- [ ] **No image compression**: Original file size is preserved
- [ ] **No image resizing**: No optimized versions for different screen sizes
- [ ] **No virus scanning**: Uploaded files are not scanned for malware
- [ ] **No file content validation**: Only MIME type is checked, not actual file content

### Security & Access Control
- [ ] **No presigned URLs**: Files are accessed via direct URLs with no authentication
- [ ] **No per-file access control**: Anyone with the URL can download the file
- [ ] **No rate limiting on uploads**: Beyond general API rate limits
- [ ] **No file encryption**: Files are stored in plain text
- [ ] **No backup mechanism**: MinIO data volume is not backed up automatically

### Error Handling & Recovery
- [ ] **No transaction rollback**: If candidate creation fails after upload, files aren't automatically cleaned up
- [ ] **No retry mechanism**: Failed uploads don't automatically retry
- [ ] **No partial upload handling**: Large files that fail mid-upload leave incomplete data
- [ ] **No quota management**: No per-user or total storage limits

### API & Integration
- [ ] **No backward compatibility**: Old `/submit` endpoint accepting JSON with URL strings is completely replaced
- [ ] **No file download endpoint**: No dedicated endpoint to serve files through the backend
- [ ] **No file metadata endpoint**: Cannot retrieve file metadata (size, type, upload date) via API
- [ ] **No batch upload**: Cannot upload multiple files at once
- [ ] **No file replacement**: Cannot update files for existing candidates

### Monitoring & Observability
- [ ] **No upload metrics**: No tracking of upload success/failure rates
- [ ] **No storage monitoring**: No alerts for disk space usage
- [ ] **No performance tracking**: No monitoring of upload times
- [ ] **No audit logging for files**: File uploads not logged to audit system (only candidate creation)

### Testing
- [ ] **No unit tests**: StorageService and StorageController have no tests
- [ ] **No integration tests**: End-to-end file upload flow not tested
- [ ] **No load testing**: Performance under concurrent uploads unknown

### Development Experience
- [ ] **No local development file storage**: Must run MinIO even for local development
- [ ] **No file seeding**: No easy way to populate MinIO with test files
- [ ] **No mock storage**: No in-memory storage option for faster testing

---

## ⚠️ Edge Cases & Gotchas

### Network & Connectivity
1. **MinIO must be running before backend starts**: Backend will throw error if MinIO is unreachable
2. **Container hostname differences**: Dev uses `localhost`, prod uses `minio` - environment variables must match
3. **Port conflicts**: Ensure ports 9000 and 9001 are available on host machine

### File Upload
1. **Concurrent uploads**: Not tested - may have race conditions in file naming
2. **Large files**: No streaming - entire file loaded into memory before upload
3. **Special characters in filenames**: Not tested - may cause URL encoding issues
4. **Duplicate filenames**: Handled via UUID prefix, but original name is preserved
5. **Email as identifier**: Uses email as folder path - may have issues if email contains special characters

### Database Consistency
1. **Orphaned files**: If MongoDB insert fails after upload, files remain in MinIO
2. **URL format**: Hardcoded `http://` - will break if SSL is enabled
3. **No referential integrity**: Deleting candidate doesn't delete files (foreign key relationship)

### Validation Gaps
1. **MIME type spoofing**: Client can send fake MIME type - only header checked, not content
2. **File extension validation**: Not checking if file extension matches MIME type
3. **Empty files**: No validation for zero-byte files
4. **Corrupted files**: No validation to ensure files are valid for their type

---

## 🔧 Configuration Requirements

### Minimum Required Environment Variables
```env
MINIO_ENDPOINT=localhost          # or 'minio' in prod
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_BUCKET_NAME=cnc-recruit-files
MINIO_USE_SSL=false
MAX_PROFILE_SIZE_MB=5
MAX_TRANSCRIPT_SIZE_MB=10
```

### Docker Services Required
- `mongo` - MongoDB database
- `mongo-init` - MongoDB replica set initialization
- `minio` - MinIO object storage
- `minio-init` - MinIO bucket creation (runs once)

### Startup Order
1. Start MongoDB and wait for healthy
2. Start MinIO and wait for healthy
3. Run mongo-init to initialize replica set
4. Run minio-init to create bucket
5. Start backend API

---

## 📋 Testing Checklist

### Manual Testing Required
- [ ] Upload valid profile image (JPEG, 2MB) + valid transcript (PDF, 5MB)
- [ ] Upload oversized profile image (10MB) → should return 413
- [ ] Upload invalid profile format (GIF) → should return 415
- [ ] Upload invalid transcript format (DOCX) → should return 415
- [ ] Upload oversized transcript (15MB) → should return 413
- [ ] Upload with missing files → should return 400
- [ ] Upload with MinIO down → should return 503
- [ ] Duplicate email submission → should return 409
- [ ] Check files appear in MinIO console
- [ ] Check URLs in MongoDB document
- [ ] Download files via URLs from browser
- [ ] Delete candidate and verify files remain (known issue)

### Automated Testing Needed
- [ ] Unit tests for StorageService methods
- [ ] Unit tests for file validation logic
- [ ] Integration tests for upload flow
- [ ] Error handling tests (MinIO down, network timeout)
- [ ] Load tests for concurrent uploads

---

## 🚀 Future Improvements

### High Priority
1. **File cleanup on candidate deletion**: Add hook to delete files when candidate is deleted
2. **Transaction rollback**: Clean up uploaded files if candidate creation fails
3. **File content validation**: Verify actual file content matches MIME type
4. **Unit tests**: Add comprehensive test coverage

### Medium Priority
5. **Presigned URLs**: Generate temporary URLs with expiration
6. **File update endpoint**: Allow replacing files for existing candidates
7. **Image optimization**: Compress and resize images on upload
8. **Backup mechanism**: Automated MinIO volume backups

### Low Priority
9. **Virus scanning**: Integrate ClamAV or similar
10. **CDN integration**: Serve files through CDN
11. **File metadata API**: Endpoint to retrieve file information
12. **Storage quotas**: Per-user and total storage limits
13. **Monitoring dashboards**: Track upload metrics and storage usage
14. **Direct upload**: Client-to-MinIO upload with presigned URLs

---

## 📚 Additional Notes

### File URL Format
```
http://{MINIO_ENDPOINT}:{MINIO_PORT}/{MINIO_BUCKET_NAME}/{key}
```
Example: `http://localhost:9000/cnc-recruit-files/profiles/john@example.com/1737245678123-abc123-profile.jpg`

### File Key Format
```
{fileType}s/{candidateEmail}/{timestamp}-{random}-{originalName}
```
- `fileType`: "profile" or "transcript" (pluralized)
- `candidateEmail`: User's email address
- `timestamp`: Unix timestamp in milliseconds
- `random`: 13-character random string
- `originalName`: Original filename from upload

### Error Status Codes
- `400 Bad Request`: Invalid request body
- `409 Conflict`: Duplicate candidate email
- `413 Payload Too Large`: File size exceeds limit
- `415 Unsupported Media Type`: Invalid file type
- `500 Internal Server Error`: File upload failed
- `503 Service Unavailable`: MinIO connection failed

### MinIO Credentials
- **Console URL**: http://localhost:9001 (dev) or http://{host}:9001 (prod)
- **Default Username**: `minioadmin`
- **Default Password**: `minioadmin123`
- **API Endpoint**: http://localhost:9000 (dev) or http://{host}:9000 (prod)

---

## 🐛 Known Bugs

1. **No cleanup on error**: If candidate creation fails after successful file upload, the uploaded files remain in MinIO as orphaned objects
2. **Hardcoded HTTP**: URLs use `http://` scheme - will fail if MINIO_USE_SSL=true
3. **Email-based folders**: Using email as folder path may break with special characters or very long emails

---

## 📞 Support

For issues or questions:
1. Check MinIO logs: `docker logs minio`
2. Check backend logs for StorageService errors
3. Access MinIO Console to verify bucket contents
4. Verify environment variables are set correctly
5. Ensure all Docker services are running

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Alpha - Needs testing and cleanup logic
