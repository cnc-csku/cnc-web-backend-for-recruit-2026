# API Endpoints Documentation

## Overview
The CNC Recruit 2026 Backend API provides RESTful endpoints for managing the entire recruitment process. All endpoints are documented via OpenAPI and available at `/openapi` when running in development mode.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://[your-domain]`

## Authentication
Most endpoints require authentication via Google OAuth. Admin-only endpoints require the `Admin` role.

### Authentication Headers
```
Authorization: Bearer <jwt-token>
```

## Response Formats

### Success Response
```json
{
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "code": "ERROR_CODE",
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Public Endpoints (No Authentication Required)

### 1. Health Check
```
GET /health
```
**Response**: `{ "ok": true }`

### 2. Root Endpoint
```
GET /
```
**Response**: Application information

### 3. Form Configuration (Public)
```
GET /form/public
```
**Response**: Current form schedule and status

### 4. Available Interview Slots
```
GET /interview-slot/public
```
**Response**: List of available interview slots

---

## Candidate Endpoints (User Authentication Required)

### 1. Submit Candidate Application
```
POST /candidate
Content-Type: multipart/form-data
```
**Request Body**: `CreateCandidateBody` with file uploads
**Response**: Created candidate document

### 2. Get Candidate Profile
```
GET /candidate/me
```
**Response**: Current user's candidate profile

### 3. Update Candidate Profile
```
PATCH /candidate/me
```
**Request Body**: `UpdateCandidateBody`
**Response**: Updated candidate document

### 4. Withdraw Application
```
POST /candidate/me/withdraw
```
**Response**: Success confirmation

---

## Admin Endpoints (Admin Authentication Required)

### User Management

#### 1. Get All Users
```
GET /admin/users
```
**Query Parameters**: `page`, `limit`
**Response**: Paginated list of users

#### 2. Promote User to Admin
```
POST /admin/users/:email/promote
```
**Response**: Success confirmation

#### 3. Demote User to Regular User
```
POST /admin/users/:email/demote
```
**Response**: Success confirmation

#### 4. Ban User
```
POST /admin/users/:email/ban
```
**Response**: Success confirmation

#### 5. Unban User
```
POST /admin/users/:email/unban
```
**Response**: Success confirmation

### Candidate Management (Admin)

#### 1. Get All Candidates
```
GET /admin/candidates
```
**Query Parameters**: `page`, `limit`, `status`, `search`
**Response**: Paginated list of candidates

#### 2. Get Candidate by ID
```
GET /admin/candidates/:id
```
**Response**: Candidate document with interview questions

#### 3. Update Candidate (Admin)
```
PATCH /admin/candidates/:id
```
**Request Body**: `UpdateCandidateBody`
**Response**: Updated candidate document

#### 4. Delete Candidate
```
DELETE /admin/candidates/:id
```
**Response**: Success confirmation

#### 5. Assign Interview Slot
```
POST /admin/candidates/:id/assign-slot
```
**Request Body**: `{ "slotId": "..." }`
**Response**: Updated candidate with slot assignment

#### 6. Unassign Interview Slot
```
POST /admin/candidates/:id/unassign-slot
```
**Request Body**: `{ "slotId": "..." }`
**Response**: Updated candidate without slot

#### 7. Change Interview Slot
```
POST /admin/candidates/:id/change-slot
```
**Request Body**: `{ "newSlotId": "..." }`
**Response**: Updated candidate with new slot

#### 8. Update Interview Status
```
PATCH /admin/candidates/:id/interview-status
```
**Request Body**: `{ "status": "PENDING"|"SHORTLISTED"|"INTERVIEWING"|"PASSED"|"FAILED" }`
**Response**: Updated candidate

#### 9. Append Interview Room
```
POST /admin/candidates/:id/interview-room
```
**Request Body**: `{ "interviewRoom": "ATTITUDE"|"TECHNICAL" }`
**Response**: Updated candidate with appended room in `currentInterviewRoom` array. If `currentInterviewRoom` was `null`, it is initialized as an array with the provided room.

#### 10. Remove Interview Room
```
DELETE /admin/candidates/:id/interview-room
```
**Request Body**: `{ "interviewRoom": "ATTITUDE"|"TECHNICAL" }`
**Response**: Updated candidate with the specified room removed from `currentInterviewRoom` array. If the array becomes empty after removal, it is set to `null`.
**Error**: Returns `400 NO_INTERVIEW_ROOM` if `currentInterviewRoom` is `null` or empty.

### Form Configuration Management

#### 1. Get Form Configuration
```
GET /admin/form
```
**Response**: Current form configuration

#### 2. Update Form Schedule
```
PATCH /admin/form/schedule
```
**Request Body**: `{ "opensAt": "...", "closesAt": "..." }`
**Response**: Updated form configuration

#### 3. Set Form Allow Submit
```
PATCH /admin/form/allow-submit
```
**Request Body**: `{ "allowSubmit": true|false }`
**Response**: Updated form configuration

#### 4. Set Editable Until
```
PATCH /admin/form/editable-until
```
**Request Body**: `{ "editableUntil": "..." }`
**Response**: Updated form configuration

#### 5. Set Countdown
```
PATCH /admin/form/countdown
```
**Request Body**: `{ "countdownTitle": "...", "countdownTime": "...", "timeupMessage": "...", "recruitState": 0|1|2|3 }`
**Response**: Updated form configuration

### Interview Slot Management

#### 1. Get All Interview Slots
```
GET /admin/interview-slot
```
**Query Parameters**: `page`, `limit`, `status`, `date`
**Response**: Paginated list of interview slots

#### 2. Create Interview Slot
```
POST /admin/interview-slot
```
**Request Body**: `CreateInterviewSlotBody`
**Response**: Created interview slot

#### 3. Get Interview Slot by ID
```
GET /admin/interview-slot/:id
```
**Response**: Interview slot with candidate details

#### 4. Update Interview Slot
```
PATCH /admin/interview-slot/:id
```
**Request Body**: Partial `InterviewSlot` fields
**Response**: Updated interview slot

#### 5. Delete Interview Slot
```
DELETE /admin/interview-slot/:id
```
**Response**: Success confirmation

#### 6. Close Interview Slot
```
POST /admin/interview-slot/:id/close
```
**Response**: Updated interview slot with `CLOSE` status

#### 7. Reopen Interview Slot
```
POST /admin/interview-slot/:id/reopen
```
**Response**: Updated interview slot with `VACANT`/`FULL` status

### Interview Question Management

#### 1. Get Interview Questions for Candidate
```
GET /admin/interview-question/:candidateId
```
**Response**: Interview questions document

#### 2. Add Question to Room
```
POST /admin/interview-question/:candidateId/question
```
**Request Body**: `{ "room": "technical"|"attitude", "title": "...", "answer": "...", "score": 0-10 }`
**Response**: Updated interview questions

#### 3. Update Question
```
PATCH /admin/interview-question/:candidateId/question/:questionIndex
```
**Request Body**: `{ "title": "...", "answer": "...", "score": 0-10 }` (all optional)
**Response**: Updated interview questions

#### 4. Delete Question
```
DELETE /admin/interview-question/:candidateId/question/:questionIndex
```
**Response**: Updated interview questions

#### 5. Add Reviewer
```
POST /admin/interview-question/:candidateId/reviewer
```
**Request Body**: `{ "name": "...", "score": 0-10, "notes": "...", "room": "TECHNICAL"|"ATTITUDE" }`
**Response**: Updated interview questions

#### 6. Update Audio Recordings
```
PATCH /admin/interview-question/:candidateId/audio
```
**Request Body**: `{ "technical": "...", "attitude": "..." }` (optional, nullable)
**Response**: Updated interview questions

### Audit Log Management

#### 1. Get Audit Logs
```
GET /admin/audit-logs
```
**Query Parameters**: `page`, `limit`, `actor`, `action`, `targetType`, `startDate`, `endDate`
**Response**: Paginated audit logs

#### 2. Get Audit Log by ID
```
GET /admin/audit-logs/:id
```
**Response**: Audit log document

---

## File Upload Endpoints

### 1. Upload Profile Image
```
POST /candidate/upload/profile
Content-Type: multipart/form-data
```
**Request**: `profileImage` file field
**Response**: `{ "key": "s3-key", "url": "public-url" }`

### 2. Upload Transcript
```
POST /candidate/upload/transcript
Content-Type: multipart/form-data
```
**Request**: `transcript` file field
**Response**: `{ "key": "s3-key" }`

### 3. Get File URL
```
GET /storage/url/:key
```
**Response**: `{ "url": "presigned-url" }`

---

## WebSocket/Real-time Endpoints
*Note: Real-time features are not currently implemented but are planned for future versions.*

---

## Rate Limiting
All endpoints are rate limited to **100 requests per minute per IP address**.

## CORS Configuration
- Origins: All origins allowed (configurable)
- Methods: GET, POST, PATCH, PUT, DELETE
- Headers: Content-Type, Authorization
- Credentials: true
- Max Age: 86400 seconds (24 hours)

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity (business logic error)
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

### Application Error Codes
- `FORM_CLOSED`: Form submission period has ended
- `FORM_NOT_OPEN`: Form submission period has not started
- `EDIT_PERIOD_ENDED`: Candidate edit period has ended
- `SLOT_FULL`: Interview slot is at maximum capacity
- `SLOT_CLOSED`: Interview slot is manually closed
- `CANDIDATE_WITHDRAWN`: Candidate has withdrawn application
- `DUPLICATE_NISIT_ID`: Nisit ID already exists
- `DUPLICATE_EMAIL`: Email already exists
- `INVALID_FILE_TYPE`: Unsupported file type
- `FILE_UPLOAD_FAILED`: File upload to S3 failed
- `NO_INTERVIEW_ROOM`: Candidate has no interview room assigned (cannot remove from null/empty currentInterviewRoom)

## OpenAPI Integration

### Accessing Documentation
In development mode, visit: `http://localhost:3000/openapi`

### OpenAPI Configuration
- **Title**: CNC Recruit 2026 Backend API
- **Version**: 1.0.0
- **Description**: Recruitment management system for CNC club
- **Tags**: Organized by feature (candidate, admin, form, etc.)

### Auto-generated Documentation Features
- Interactive API testing
- Request/response schemas
- Authentication requirements
- Query parameter documentation
- Example requests

## Testing Endpoints

### 1. Using cURL
```bash
# Health check
curl http://localhost:3000/health

# Get form configuration (public)
curl http://localhost:3000/form/public

# Submit candidate (with authentication)
curl -X POST http://localhost:3000/candidate \
  -H "Authorization: Bearer <token>" \
  -F "nisitId=1234567890" \
  -F "firstName=John" \
  -F "profileImage=@profile.jpg"
```

### 2. Using Postman/Insomnia
1. Import OpenAPI specification from `/openapi/json`
2. Set base URL
3. Configure authentication
4. Test endpoints interactively

### 3. Using Frontend Application
- Use axios/fetch with proper headers
- Handle file uploads with FormData
- Implement error handling for rate limits

## Versioning
Current API version: **v1**

### Versioning Strategy
- URL-based versioning planned for future (`/api/v1/...`)
- Backward compatibility maintained within major versions
- Deprecation notices in response headers

## Monitoring and Analytics
- All requests logged with audit trail
- Rate limit headers included in responses
- Error tracking via structured logging
- Performance metrics via request timing

## Security Considerations

### 1. Input Validation
- All inputs validated with TypeBox schemas
- File type and size validation
- SQL injection prevention (MongoDB driver)
- XSS protection via output encoding

### 2. Authentication Security
- JWT tokens with expiration
- Google OAuth for identity verification
- Role-based access control
- IP tracking for suspicious activity

### 3. File Security
- S3 bucket policies for public/private access
- Presigned URLs with expiration
- File type validation
- Malware scanning (future enhancement)

### 4. API Security
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Security headers via Helmet.js
- HTTPS enforcement in production

## Performance Considerations

### 1. Database Queries
- Pagination for large datasets
- Projection to limit returned fields
- Index optimization for common queries
- Connection pooling

### 2. File Handling
- Stream-based uploads/downloads
- Async processing for large files
- CDN for public images (future)
- Cache headers for static content

### 3. Response Optimization
- Compression via middleware
- ETag headers for caching
- Minimal payloads
- Batch operations where possible

## Future API Enhancements

### Planned Endpoints
- `/notifications` - Push notifications
- `/analytics` - Recruitment analytics
- `/export` - Data export functionality
- `/backup` - System backup management

### WebSocket Support
- Real-time candidate updates
- Live interview scheduling
- Admin dashboard notifications

### GraphQL Alternative
- Optional GraphQL endpoint
- Schema stitching for microservices
- Apollo Server integration