# CNC Recruit 2026 Backend API - Project Overview

## Project Purpose
The CNC Recruit 2026 Backend API is a comprehensive recruitment management system for the Computer Network and Communication (CNC) club at Kasetsart University. It handles the entire recruitment process from candidate applications to interview scheduling and evaluation.

## Core Functionality
- **Candidate Application Management**: Complete application forms with file uploads
- **Form Configuration**: Time-based form opening/closing with countdown features
- **Interview Scheduling**: Slot-based interview scheduling system
- **Interview Evaluation**: Technical and attitude question tracking with scoring
- **User Management**: Role-based access control with Google OAuth
- **Audit Logging**: Comprehensive tracking of all system actions
- **File Storage**: Secure file uploads for profiles and transcripts

## Technology Stack

### Backend Framework
- **Runtime**: Bun (v1.x)
- **Framework**: Elysia.js (v1.4.22)
- **Language**: TypeScript

### Database
- **Primary Database**: MongoDB (v7.x)
- **ODM**: Native MongoDB driver with TypeScript types

### Storage
- **File Storage**: S3-compatible storage (MinIO)
- **Client**: AWS SDK v3 for S3

### Authentication & Security
- **Authentication**: Google OAuth with JWT
- **Security**: Helmet.js, CORS, Rate Limiting
- **Validation**: Elysia validation with TypeBox/Zod

### API Documentation
- **OpenAPI**: @elysiajs/openapi integration
- **Auto-generated**: Interactive API documentation at `/openapi`

### Deployment
- **Containerization**: Docker with Docker Compose
- **Orchestration**: Separate development and production configurations
- **Build Tool**: Makefile for common operations

## Project Structure
```
cnc-web-backend-for-recruit-2026/
├── src/
│   ├── app.ts              # Main application setup
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
├── memory-bank/         # Project documentation (this folder)
└── [configuration files]
```

## Key Design Principles

### 1. Clean Architecture
- Clear separation between controllers, services, and models
- Dependency injection for testability
- Business logic isolated in service layer

### 2. Type Safety
- Full TypeScript support throughout
- Runtime validation with TypeBox/Zod
- MongoDB collections with typed schemas

### 3. Audit-First Design
- All significant actions are logged
- Change tracking with before/after states
- Comprehensive audit trail for compliance

### 4. File Handling
- Secure file uploads with S3 storage
- Public/private access policies
- Automatic bucket creation and configuration

### 5. Time-Based Controls
- Form submission windows
- Editable periods for candidates
- Countdown features for recruitment events

## Development Status
- **Version**: 1.0.50
- **Environment**: Production-ready
- **Deployment**: Docker-based with MongoDB replica sets
- **Monitoring**: Built-in logging with audit trails

## Getting Started
See the [development guide](./development-guide.md) for setup instructions and [deployment guide](./deployment.md) for production deployment.

## Related Documentation
- [Architecture Documentation](./architecture.md)
- [API Endpoints](./api-endpoints.md)
- [Data Models](./data-models.md)
- [Authentication Flow](./authentication-flow.md)