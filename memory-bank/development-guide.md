# Development Guide

## Overview
This guide provides comprehensive instructions for setting up a development environment, understanding the codebase structure, and contributing to the CNC Recruit 2026 Backend API.

## Development Environment Setup

### 1. Prerequisites

#### Required Software
- **Node.js**: Version 18+ (Bun runtime included)
- **Docker**: Version 20.10+ with Docker Compose
- **Git**: Version control system
- **Code Editor**: VS Code (recommended) or any editor with TypeScript support

#### VS Code Extensions (Recommended)
- **TypeScript and JavaScript Language Features**
- **ESLint**
- **Prettier**
- **MongoDB for VS Code**
- **Docker**
- **Thunder Client** (API testing)

### 2. Initial Setup

#### Clone Repository
```bash
git clone https://github.com/cnc-csku/cnc-web-backend-for-recruit-2026.git
cd cnc-web-backend-for-recruit-2026
```

#### Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

#### Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# See deployment.md for environment variable details
```

### 3. Start Development Environment

#### Using Make Commands
```bash
# Start all services (MongoDB, MinIO, Application)
make dev

# Stop and clean up
make cleardev
```

#### Manual Start
```bash
# Start dependencies only
docker compose -f dev.docker-compose.yaml up mongo minio -d

# Run application with hot reload
bun dev
```

### 4. Verify Setup

#### Check Services
```bash
# Application health
curl http://localhost:3000/health

# MongoDB connection
mongosh "mongodb://localhost:27017"

# MinIO console
open http://localhost:9001
```

#### Test API Endpoints
```bash
# Get OpenAPI documentation
open http://localhost:3000/openapi

# Test public endpoints
curl http://localhost:3000/form/public
```

## Codebase Structure

### 1. Directory Overview

```
cnc-web-backend-for-recruit-2026/
├── src/                    # Source code
│   ├── app.ts             # Main application setup
│   ├── index.ts           # Application entry point
│   ├── core/              # Core infrastructure
│   │   ├── bootstrap.ts   # System initialization
│   │   ├── config.ts      # Configuration management
│   │   ├── db.ts          # Database connection
│   │   ├── errors.ts      # Custom error types
│   │   ├── logger.ts      # Logging utilities
│   │   ├── openapi.ts     # OpenAPI configuration
│   │   └── storage/       # File storage system
│   ├── features/          # Business features
│   │   ├── admin/         # Admin routes
│   │   ├── auditLog/      # Audit logging system
│   │   ├── auth/          # Authentication system
│   │   ├── candidate/     # Candidate management
│   │   ├── form/          # Form configuration
│   │   ├── interviewQuestion/ # Interview questions
│   │   └── InterviewSlot/ # Interview scheduling
│   ├── lib/              # Shared libraries
│   │   └── controllers.ts # Controller dependency injection
│   └── utils/            # Utility functions
├── shared/               # Shared types and schemas
├── memory-bank/         # Project documentation
└── [configuration files]
```

### 2. Key Files to Understand

#### Entry Points
- `src/index.ts`: Application startup
- `src/app.ts`: Main application configuration
- `src/lib/controllers.ts`: Dependency injection setup

#### Core Infrastructure
- `src/core/config.ts`: Environment configuration
- `src/core/db.ts`: Database connection management
- `src/core/bootstrap.ts`: System initialization

#### Feature Structure (Example: Candidate)
```
src/features/candidate/
├── candidate.controller.ts  # Request handling
├── candidate.service.ts     # Business logic
├── candidate.model.ts       # Data schema
├── candidate.route.ts       # Route definitions
├── candidate.openapi.ts     # OpenAPI documentation
├── candidate.file.ts        # File handling
└── candidate.withdraw.service.ts  # Specialized service
```

## Development Workflow

### 1. Feature Development Process

#### Step 1: Understand Requirements
- Review existing similar features
- Check data models in `shared/shared.model.ts`
- Understand audit logging requirements

#### Step 2: Create Data Model
```typescript
// Example: Create new model file
// src/features/your-feature/your-feature.model.ts
import { t } from "elysia";
import { db } from "../../core/db";

export const YourFeatureModel = {
  entity: t.Object({
    // Define schema fields
    name: t.String(),
    status: t.Union([t.Literal("ACTIVE"), t.Literal("INACTIVE")]),
    createdAt: t.Date(),
  }),
};

export type YourFeature = typeof YourFeatureModel.entity.static;
export const yourFeatureCol = (await db()).collection<YourFeature>("your_feature");
```

#### Step 3: Create Service
```typescript
// src/features/your-feature/your-feature.service.ts
import { AuditLogController } from "../auditLog/audit.controller";
import { YourFeature, yourFeatureCol } from "./your-feature.model";

export class YourFeatureService {
  constructor(private auditLog: AuditLogController) {}

  async createFeature(data: Partial<YourFeature>, meta: AuditMeta) {
    // Business logic here
    const result = await yourFeatureCol.insertOne(data);
    
    // Audit logging
    await this.auditLog.log({
      actor: meta.actor,
      action: "CREATE_FEATURE",
      target: { type: "YOUR_FEATURE", id: result.insertedId.toString() },
      ip: meta.ip,
    });
    
    return result;
  }
}
```

#### Step 4: Create Controller
```typescript
// src/features/your-feature/your-feature.controller.ts
import { YourFeatureService } from "./your-feature.service";

export class YourFeatureController {
  constructor(private service: YourFeatureService) {}

  async create(data: Partial<YourFeature>, meta: AuditMeta) {
    return await this.service.createFeature(data, meta);
  }
}
```

#### Step 5: Create Routes
```typescript
// src/features/your-feature/your-feature.route.ts
import { Elysia, t } from "elysia";
import { YourFeatureController } from "./your-feature.controller";
import { requireRole } from "../auth/auth.guard";

export const yourFeatureRoute = (controller: YourFeatureController) =>
  new Elysia({ prefix: "/your-feature" })
    .use(requireRole("Admin"))
    .post(
      "/",
      async ({ body, user, ip }) => {
        const result = await controller.create(body, {
          actor: { email: user.email },
          ip,
        });
        return { data: result, message: "Feature created successfully" };
      },
      {
        body: t.Object({
          name: t.String(),
          status: t.Union([t.Literal("ACTIVE"), t.Literal("INACTIVE")]),
        }),
        detail: {
          operationId: "createYourFeature",
          summary: "Create a new feature",
          tags: ["Your Feature"],
        },
      },
    );
```

#### Step 6: Register in Controllers
```typescript
// Update src/lib/controllers.ts
const yourFeatureService = new YourFeatureService(auditLogController);
const yourFeatureController = new YourFeatureController(yourFeatureService);

export {
  // ... existing exports
  yourFeatureController,
};
```

#### Step 7: Add to Application
```typescript
// Update src/app.ts
import { yourFeatureRoute } from "./features/your-feature/your-feature.route";

// Add to app configuration
.use(yourFeatureRoute(yourFeatureController))
```

### 2. Code Style Guidelines

#### TypeScript Conventions
- Use explicit types (avoid `any`)
- Prefer interfaces for object shapes
- Use `type` for unions, intersections, and aliases
- Export types and interfaces from model files

#### Naming Conventions
- **Files**: kebab-case (e.g., `candidate.service.ts`)
- **Classes**: PascalCase (e.g., `CandidateService`)
- **Variables**: camelCase (e.g., `candidateService`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Database Collections**: snake_case (e.g., `candidates`)

#### Error Handling
- Use custom `DomainError` from `src/core/errors.ts`
- Always log errors with context
- Provide user-friendly error messages
- Include error codes for client handling

#### Audit Logging
- Log all significant actions
- Include before/after state for updates
- Use consistent action names
- Include IP and user context

### 3. Testing Guidelines

#### Unit Tests
```typescript
// Example unit test
import { describe, it, expect, beforeEach } from "bun:test";
import { CandidateService } from "./candidate.service";

describe("CandidateService", () => {
  let service: CandidateService;

  beforeEach(() => {
    service = new CandidateService(
      mockInterviewQuestionController,
      mockCandidateFileHandler,
      mockFormController,
      mockAuditLogController
    );
  });

  it("should create candidate with valid data", async () => {
    const result = await service.createCandidate(validData, mockMeta);
    expect(result).toHaveProperty("insertedId");
  });

  it("should reject duplicate nisitId", async () => {
    await expect(
      service.createCandidate(duplicateData, mockMeta)
    ).rejects.toThrow("DUPLICATE_NISIT_ID");
  });
});
```

#### Integration Tests
- Test complete API endpoints
- Use test database instance
- Clean up test data after tests
- Mock external services

#### Test Structure
```
__tests__/
├── unit/
│   ├── services/
│   ├── controllers/
│   └── utils/
├── integration/
│   ├── api/
│   ├── database/
│   └── storage/
└── e2e/
    ├── candidate-flow/
    └── admin-flow/
```

### 4. Database Development

#### Schema Changes
1. Update TypeScript interfaces in model files
2. Update validation schemas
3. Create migration script if needed
4. Update existing data with default values

#### Index Management
- Add indexes for common query patterns
- Monitor query performance
- Use compound indexes for frequent filters
- Consider text indexes for search fields

#### Data Migration Example
```javascript
// migration-001-add-new-field.js
db.candidates.updateMany(
  {},
  { $set: { newField: "defaultValue" } }
);
```

### 5. API Development

#### OpenAPI Documentation
- Add `detail` property to route handlers
- Include operationId, summary, description, and tags
- Document request/response schemas
- Specify authentication requirements

#### Example OpenAPI Configuration
```typescript
{
  detail: {
    operationId: "getCandidateById",
    summary: "Get candidate by ID",
    description: "Retrieve candidate details including interview questions",
    tags: ["Candidate"],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Candidate ID"
      }
    ],
    responses: {
      200: {
        description: "Candidate details",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CandidateWithQuestions" }
          }
        }
      }
    }
  }
}
```

#### Request Validation
- Use TypeBox schemas for runtime validation
- Validate file types and sizes
- Sanitize input data
- Handle edge cases gracefully

#### Response Formatting
- Consistent response structure
- Include pagination metadata
- Handle errors uniformly
- Include relevant links (HATEOAS)

## Debugging and Troubleshooting

### 1. Common Development Issues

#### Application Won't Start
```bash
# Check Docker containers
docker ps

# View application logs
docker compose -f dev.docker-compose.yaml logs app

# Check environment variables
echo $NODE_ENV

# Verify dependencies
bun install
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017"

# Check replica set status
mongosh --eval "rs.status()"

# View MongoDB logs
docker compose -f dev.docker-compose.yaml logs mongo
```

#### File Upload Issues
```bash
# Check MinIO status
curl http://localhost:9000/minio/health/live

# Access MinIO console
open http://localhost:9001

# Test bucket permissions
aws --endpoint-url http://localhost:9000 s3 ls s3://cnc-recruit-2026
```

### 2. Debugging Tools

#### VS Code Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "bun",
      "request": "launch",
      "name": "Debug API",
      "program": "src/index.ts",
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### Logging Levels
```typescript
import { logger } from "../core/logger";

// Different log levels
logger.debug("Detailed debug information");
logger.info("General information");
logger.warn("Warning message");
logger.error("Error message", error);
```

#### API Testing Tools
- **Thunder Client**: VS Code extension
- **Postman**: Desktop application
- **curl**: Command line tool
- **OpenAPI UI**: http://localhost:3000/openapi

### 3. Performance Profiling

#### Database Query Optimization
```javascript
// Enable query profiling
db.setProfilingLevel(2);

// Analyze slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

#### Memory Usage
```bash
# Monitor container resources
docker stats

# Check Bun memory usage
bun --inspect src/index.ts
```

#### Network Analysis
```bash
# Monitor API requests
docker compose -f dev.docker-compose.yaml logs app --tail=100

# Test response times
curl -w "%{time_total}\n" http://localhost:3000/health
```

## Best Practices

### 1. Code Quality

#### Code Reviews
- Review all changes before merging
- Check for security vulnerabilities
- Ensure proper error handling
- Verify audit logging
- Test edge cases

#### Documentation
- Document complex business logic
- Update API documentation
- Include code comments for non-obvious logic
- Maintain changelog

#### Testing
- Write tests for new features
- Maintain test coverage
- Test error conditions
- Perform integration testing

### 2. Security

#### Input Validation
- Validate all user input
- Sanitize file uploads
- Prevent NoSQL injection
- Implement rate limiting

#### Authentication
- Never hardcode credentials
- Use environment variables
- Implement proper session management
- Regular security audits

#### Data Protection
- Encrypt sensitive data
- Implement access controls
- Regular backup procedures
- Data retention policies

### 3. Performance

#### Database Optimization
- Use appropriate indexes
- Implement connection pooling
- Cache frequently accessed data
- Monitor query performance

#### API Optimization
- Implement pagination
- Use compression
- Cache responses where appropriate
- Monitor response times

#### File Handling
- Stream large files
- Implement chunked uploads
- Use CDN for static content
- Optimize image sizes

## Contributing Guidelines

### 1. Branch Strategy

#### Main Branches
- `main`: Production-ready code
- `develop`: Integration branch for features

#### Feature Branches
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Keep branch updated
git pull origin develop

# Push changes
git push origin feature/your-feature-name
```

#### Naming Conventions
- `feature/`: New features
- `bugfix/`: Bug fixes
- `hotfix/`: Critical production fixes
- `release/`: Release preparation

### 2. Pull Request Process

#### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No security issues
- [ ] Audit logging implemented
- [ ] Performance considered

#### PR Description Template
```
## Description
Brief description of changes

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Screenshots (if applicable)
```

### 3. Release Process

#### Versioning
- Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- Update `package.json` version
- Create release notes

#### Deployment Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Database migrations ready
- [ ] Backup performed
- [ ] Rollback plan prepared

## Resources

### 1. Documentation
- **This Memory Bank**: Comprehensive project documentation
- **OpenAPI Docs**: http://localhost:3000/openapi
- **Elysia.js Docs**: https://elysiajs.com
- **Bun Docs**: https://bun.sh/docs
- **MongoDB Docs**: https://docs.mongodb.com

### 2. Tools
- **Docker Desktop**: Container management
- **MongoDB Compass**: Database GUI
- **MinIO Console**: File storage management
- **VS Code**: Code editor

### 3. Support
- **GitHub