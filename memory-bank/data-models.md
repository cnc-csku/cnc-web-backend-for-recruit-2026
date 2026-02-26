# Data Models and Schemas

## Overview
This document describes all MongoDB collections and their schemas used in the CNC Recruit 2026 Backend API. All schemas are defined using TypeBox and provide runtime validation.

## Collection Summary

| Collection | Description | Document Count | Indexes |
|------------|-------------|----------------|---------|
| `users` | System users (Admin/User) | Small | `_id`, `email` |
| `candidates` | Candidate applications | Medium-Large | `_id`, `email`, `nisitId` |
| `form_config` | Form scheduling configuration | Single document | `_id` |
| `interview_slot` | Interview time slots | Small | `_id`, `startTime`, `status` |
| `interview_questions` | Interview questions and scores | Medium | `_id`, `candidateId` |
| `audit_logs` | System audit trail | Large | `_id`, `createdAt`, `actor.email`, `action` |

## Detailed Schema Documentation

### 1. Users Collection (`users`)

**Location**: `src/features/auth/auth.model.ts`

#### Schema Definition
```typescript
{
  email: string,           // User email (primary identifier)
  role: "Admin" | "User",  // User role
  ban: boolean,           // Whether user is banned
  createdAt: Date         // Account creation date
}
```

#### Indexes
- `_id`: Default MongoDB ObjectId
- `email`: Unique identifier for users

#### Default Admin Users
System automatically creates admin users for:
- `thanut.tha@ku.th`
- `worrapon.k@ku.th`
- `wachirawich.s@ku.th`
- `athiruj.k@ku.th`

#### Operations
- **Create**: Via Google OAuth login or admin creation
- **Update**: Role changes, ban status
- **Delete**: Not implemented (soft delete via ban)

---

### 2. Candidates Collection (`candidates`)

**Location**: `src/features/candidate/candidate.model.ts`

#### Schema Definition
```typescript
{
  email: string,                    // Candidate email
  nisitId: string,                  // 10-digit student ID
  firstName: string,                // First name
  lastName: string,                 // Last name
  nickName: string,                 // Nickname
  bio: string,                      // Personal biography
  typeOfDpm: "NORMAL" | "SPECIAL", // DPM type
  nisitYearParticipated: "83" | "84" | "85", // Academic year
  gradeGPAX: number,                // GPA (0-4, 2 decimal places)
  profileImageKey: string | null,   // S3 key for profile image
  transcriptKey: string | null,     // S3 key for transcript
  address: string,                  // Home address
  mbti: string,                     // MBTI personality type
  phoneNumber: string,              // 9-10 digit phone number
  socialContact: string,            // Social media contact
  github: string,                   // GitHub profile
  
  // Interview scheduling
  interviewSlotId?: string,         // Assigned interview slot ID
  
  // Application questions
  referralSource: "SENIOR" | "FRIEND" | "LECTURER" | "OTHER" | Array<...>,
  projectExperience: string,        // Project experience
  clubs: string,                    // Club participation
  interests: string,                // Personal interests
  hobbies: string,                  // Hobbies
  whyCnc: string,                   // Why join CNC
  expected: string,                 // Expectations from CNC
  tools: string,                    // Technical tools experience
  
  // Interview process
  currentInterviewRoom: ("ATTITUDE" | "TECHNICAL")[] | null,
  applicationStatus: "ACTIVE" | "WITHDRAWN",
  interviewStatus: "PENDING" | "SHORTLISTED" | "INTERVIEWING" | "INTERVIEWED" | "CONFIRMED" | "PASSED" | "FAILED",
  
  // Metadata
  editCount: number,                // Number of edits made
  createdAt: Date,                  // Application submission date
  updatedAt: Date | null            // Last update timestamp
}
```

#### Validation Rules
- `nisitId`: Exactly 10 characters
- `phoneNumber`: 9-10 characters
- `gradeGPAX`: 0-4 range, 2 decimal places
- `profileImage`: Image file only
- `transcript`: Image or PDF file

#### Status Transitions
```
PENDING → SHORTLISTED → INTERVIEWING → (PASSED/FAILED)
                ↓
            WITHDRAWN
```

#### File Storage
- Profile images: Stored in `cnc-profile/` prefix (public)
- Transcripts: Private storage
- File keys: Nullable for optional updates

---

### 3. Form Configuration Collection (`form_config`)

**Location**: `src/features/form/form.model.ts`

#### Schema Definition
```typescript
{
  _id: "FORM_CONFIG",              // Fixed document ID
  allowSubmit: boolean,            // Whether form submissions are allowed
  opensAt: string,                 // ISO datetime when form opens
  closesAt: string,                // ISO datetime when form closes
  editableUntil: string,           // ISO datetime until edits allowed
  countdownTitle: string | null,   // Countdown display title
  countdownTime: string | null,    // ISO datetime for countdown
  timeupMessage: string | null,    // Message when time is up
  recruitState: number             // Recruitment phase (0-3)
}
```

#### Default Values
On system bootstrap:
- `allowSubmit`: false
- `opensAt`: 2099-01-01T00:00:00Z
- `closesAt`: 2099-01-02T00:00:00Z
- `editableUntil`: 2099-01-02T00:00:00Z

#### Recruitment States
- `0`: Pre-recruitment (planning)
- `1`: Application period open
- `2`: Application period closed, reviewing
- `3`: Interview phase

---

### 4. Interview Slots Collection (`interview_slot`)

**Location**: `src/features/InterviewSlot/interviewSlot.model.ts`

#### Schema Definition
```typescript
{
  startTime: string,               // ISO datetime slot starts
  endTime: string,                 // ISO datetime slot ends
  maxCandidates: number,           // Maximum candidates (≥2)
  bookedCandidateIds: string[],    // Array of candidate ObjectIds
  status: "VACANT" | "FULL" | "CLOSE",
  createdAt: string,               // ISO creation timestamp
  updatedAt: string | null         // ISO last update timestamp
}
```

#### Status Logic
- `VACANT`: Has available capacity
- `FULL`: At maximum capacity
- `CLOSE`: Manually closed by admin

#### Capacity Management
- Auto-updates status based on `bookedCandidateIds.length`
- Minimum `maxCandidates`: 2
- Candidates referenced by ObjectId strings

---

### 5. Interview Questions Collection (`interview_questions`)

**Location**: `src/features/interviewQuestion/interviewQuestion.model.ts`

#### Schema Definition
```typescript
{
  candidateId: string,             // Reference to candidate
  
  questions: {
    technical: Array<{
      title: string,               // Question text
      answer?: string,             // Candidate's answer
      score?: number               // Score 0-10
    }>,
    attitude: Array<{
      title: string,               // Question text
      answer?: string,             // Candidate's answer
      score?: number               // Score 0-10
    }>
  },
  
  reviewers: Array<{
    name: string,                  // Reviewer name
    score: number,                 // Overall score 0-10
    notes: string,                 // Reviewer notes
    room: "TECHNICAL" | "ATTITUDE" // Interview room
  }>,
  
  audios: {
    technical: string | null,      // Audio recording key
    attitude: string | null        // Audio recording key
  },
  
  createdAt: string,               // ISO creation timestamp
  updatedAt: string | null         // ISO last update timestamp
}
```

#### Scoring System
- Individual questions: 0-10 points
- Reviewer scores: 0-10 points per room
- Audio recordings: Optional voice memos

#### Room Types
- `TECHNICAL`: Technical skills assessment
- `ATTITUDE`: Personality and attitude assessment

---

### 6. Audit Logs Collection (`audit_logs`)

**Location**: `src/features/auditLog/audit.model.ts`

#### Schema Definition
```typescript
{
  actor: {
    email: string                  // Actor's email
  },
  
  action: AuditAction,             // One of 19 defined actions
  
  target: {
    type: "CANDIDATE" | "INTERVIEW_QUESTION" | "FORM" | 
          "LOGIN" | "INTERVIEW_SLOT" | "USER",
    id: string | null              // Target document ID
  },
  
  changes?: {
    before: Record<string, unknown> | null,  // Previous state
    after: Record<string, unknown> | null    // New state
  },
  
  ip: string,                      // IP address of request
  createdAt: string                // ISO timestamp
}
```

#### Audit Actions (19 total)
**Candidate Actions**:
- `SUBMIT_CANDIDATE`, `EDIT_CANDIDATE`, `DELETE_CANDIDATE`, `WITHDRAW_CANDIDATE`

**Question Actions**:
- `ADD_QUESTION`, `UPDATE_QUESTION`, `DELETE_QUESTION`

**Form Actions**:
- `UPDATE_FORM_SCHEDULE`, `SET_FORM_ALLOW_SUBMIT`

**Interview Slot Actions**:
- `ADD_INTERVIEW_SLOT`, `DELETE_INTERVIEW_SLOT`,
- `ADD_CANDIDATE_TO_INTERVIEW_SLOT`,
- `REMOVE_CANDIDATE_FROM_INTERVIEW_SLOT`,
- `CHANGE_INTERVIEW_SLOT`

**User Actions**:
- `CREATE_USER`, `PROMOTE_USER`, `DEMOTE_USER`,
- `RESTRICT_USER`, `UNRESTRICT_USER`

#### Change Tracking
- `before`: State before change (for updates)
- `after`: State after change
- Both optional for actions without state changes

---

## Shared Types and Schemas

**Location**: `shared/shared.model.ts`

### Pagination Schema
```typescript
{
  paginationQuery: {
    page: number,     // Page number (≥1, default: 1)
    limit: number     // Items per page (1-100, default: 10)
  },
  
  paginationResponse: {
    data: any[],      // Array of results
    pagination: {
      page: number,   // Current page
      limit: number,  // Items per page
      total: number,  // Total items
      totalPages: number  // Calculated total pages
    }
  }
}
```

### OpenAPI Types
```typescript
type OpenApiDetail = Pick<
  OpenAPIV3.OperationObject,
  "operationId" | "summary" | "description" | "tags"
>;
```

---

## Database Connection Pattern

### Collection Access Pattern
```typescript
// All models follow this pattern
export const collectionName = (await db()).collection<Type>("collection_name");
```

### Connection Management
- Lazy connection initialization
- Singleton connection pool
- Automatic reconnection handling
- Connection event listeners

---

## Data Relationships

### 1. Candidate Relationships
```
Candidate → InterviewSlot (optional one-to-one)
Candidate → InterviewQuestions (optional one-to-one)
Candidate → AuditLogs (one-to-many)
```

### 2. Interview Slot Relationships
```
InterviewSlot → Candidates (one-to-many via bookedCandidateIds)
```

### 3. User Relationships
```
User → AuditLogs (one-to-many via actor.email)
```

---

## Validation Rules Summary

### Required Fields
- All models have required fields validated at API layer
- MongoDB doesn't enforce schema (application-level validation)

### Type Validation
- String length constraints (nisitId, phoneNumber)
- Numeric ranges (gradeGPAX, scores)
- Enum values (roles, statuses, types)
- Date format (ISO 8601)

### File Validation
- MIME type checking
- File size limits (implied by S3/Multer)
- Optional file updates (nullable keys)

---

## Migration Considerations

### Schema Evolution
1. Add new fields with default values
2. Make breaking changes with versioning
3. Update all TypeScript interfaces
4. Update validation schemas

### Data Migration
- Use MongoDB aggregation for data transformations
- Maintain backward compatibility during rollout
- Audit all data changes

### Index Management
- Monitor query performance
- Add indexes for common query patterns
- Consider compound indexes for frequent filters

---

## Query Patterns

### Common Queries
1. **Candidate lookup by email/nisitId**
2. **Interview slots by date range**
3. **Audit logs by actor/action**
4. **Candidates by interview status**
5. **Form configuration (single document)**

### Performance Notes
- Use projection to limit returned fields
- Paginate large result sets
- Consider read preferences for reporting
- Monitor slow queries via MongoDB profiler