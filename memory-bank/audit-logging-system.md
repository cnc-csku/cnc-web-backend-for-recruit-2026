# Audit Logging System

## Overview
The CNC Recruit 2026 Backend API includes a comprehensive audit logging system that tracks all significant actions within the application. This system provides accountability, security monitoring, and compliance capabilities.

## Architecture

### Components
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Services  │───▶│ Audit Log   │───▶│  MongoDB    │
│ & Controllers│   │  Service    │    │  Collection │
└─────────────┘    └─────────────┘    └─────────────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Action     │    │  Log Entry  │    │  Query &    │
│  Context    │    │  Creation   │    │  Analysis   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Key Features
- **Comprehensive Tracking**: 19 different action types across 6 target types
- **Change Tracking**: Before/after state capture for modifications
- **Actor Identification**: User email and IP address tracking
- **Timestamp Precision**: ISO 8601 timestamps with millisecond precision
- **Query Optimization**: Indexed for efficient retrieval

## Data Model

### Audit Log Schema
```typescript
{
  actor: {
    email: string                  // Actor's email address
  },
  
  action: AuditAction,             // One of 19 defined actions
  
  target: {
    type: AuditTarget,             // One of 6 target types
    id: string | null              // Target document ID (if applicable)
  },
  
  changes?: {                      // Optional change tracking
    before: Record<string, unknown> | null,  // State before change
    after: Record<string, unknown> | null    // State after change
  },
  
  ip: string,                      // IP address of request
  createdAt: string                // ISO 8601 timestamp
}
```

### Audit Actions (19 Total)

#### Candidate Actions (4)
- `SUBMIT_CANDIDATE`: New candidate application submitted
- `EDIT_CANDIDATE`: Candidate information updated
- `DELETE_CANDIDATE`: Candidate record deleted
- `WITHDRAW_CANDIDATE`: Candidate withdrew application

#### Interview Question Actions (3)
- `ADD_QUESTION`: New interview question added
- `UPDATE_QUESTION`: Existing question updated
- `DELETE_QUESTION`: Question removed

#### Form Configuration Actions (2)
- `UPDATE_FORM_SCHEDULE`: Form opening/closing times updated
- `SET_FORM_ALLOW_SUBMIT`: Form submission enabled/disabled

#### Interview Slot Actions (5)
- `ADD_INTERVIEW_SLOT`: New interview slot created
- `DELETE_INTERVIEW_SLOT`: Interview slot deleted
- `ADD_CANDIDATE_TO_INTERVIEW_SLOT`: Candidate assigned to slot
- `REMOVE_CANDIDATE_FROM_INTERVIEW_SLOT`: Candidate removed from slot
- `CHANGE_INTERVIEW_SLOT`: Candidate moved to different slot

#### User Management Actions (5)
- `CREATE_USER`: New user account created
- `PROMOTE_USER`: User promoted to admin role
- `DEMOTE_USER`: Admin demoted to regular user
- `RESTRICT_USER`: User banned from system
- `UNRESTRICT_USER`: User ban removed

### Target Types (6)
- `CANDIDATE`: Candidate records
- `INTERVIEW_QUESTION`: Interview questions and scores
- `FORM`: Form configuration
- `LOGIN`: Authentication events
- `INTERVIEW_SLOT`: Interview scheduling
- `USER`: User management

## Implementation

### 1. Audit Log Service (`src/features/auditLog/audit.service.ts`)

#### Core Responsibilities
- Creating audit log entries
- Managing change tracking
- Providing query capabilities
- Ensuring data integrity

#### Key Methods
```typescript
class AuditLogService {
  // Create audit log entry
  async log(params: {
    actor: { email: string };
    action: AuditAction;
    target: { type: AuditTarget; id?: string };
    changes?: { before?: any; after?: any };
    ip: string;
  }): Promise<InsertOneResult<AuditLog>>;
  
  // Query audit logs with filters
  async find(params: {
    actor?: string;
    action?: AuditAction;
    targetType?: AuditTarget;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<AuditLog>>;
  
  // Get audit log by ID
  async findById(id: string): Promise<AuditLog | null>;
}
```

### 2. Audit Log Controller (`src/features/auditLog/audit.controller.ts`)

#### API Layer
- Provides clean interface for other services
- Handles request validation
- Manages error handling
- Formats responses

#### Integration Pattern
```typescript
// Example usage in candidate service
class CandidateService {
  constructor(private auditLog: AuditLogController) {}
  
  async createCandidate(data: CreateCandidateBody, meta: AuditMeta) {
    // Business logic...
    
    // Log the action
    await this.auditLog.log({
      actor: meta.actor,
      action: "SUBMIT_CANDIDATE",
      target: {
        type: "CANDIDATE",
        id: result.insertedId.toString()
      },
      ip: meta.ip
    });
    
    return result;
  }
}
```

### 3. Audit Meta Type
```typescript
// Used throughout the application
type AuditMeta = {
  actor: {
    email: string;
  };
  ip: string;
};
```

## Change Tracking

### Before/After State Capture

#### Implementation
```typescript
// Example: Tracking candidate updates
async updateCandidate(id: string, updates: UpdateCandidateBody, meta: AuditMeta) {
  // Get current state
  const before = await candidatesCol.findOne({ _id: new ObjectId(id) });
  
  // Apply updates
  const result = await candidatesCol.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  
  // Get updated state
  const after = await candidatesCol.findOne({ _id: new ObjectId(id) });
  
  // Log with change tracking
  await this.auditLog.log({
    actor: meta.actor,
    action: "EDIT_CANDIDATE",
    target: { type: "CANDIDATE", id },
    changes: {
      before: before ? this.sanitizeForAudit(before) : null,
      after: after ? this.sanitizeForAudit(after) : null
    },
    ip: meta.ip
  });
  
  return result;
}
```

#### Data Sanitization
```typescript
private sanitizeForAudit(data: any): any {
  // Remove sensitive fields
  const { _id, __v, ...sanitized } = data;
  
  // Convert ObjectId to string
  if (sanitized._id) {
    sanitized._id = sanitized._id.toString();
  }
  
  return sanitized;
}
```

### What Gets Tracked

#### Full State Capture
- Candidate profile updates
- Form configuration changes
- Interview slot modifications
- User role changes

#### Partial State Capture
- File uploads (track metadata only)
- Bulk operations (summary information)
- System actions (minimal context)

#### Excluded from Tracking
- Password hashes (never stored)
- Temporary data
- System internal operations

## Integration Patterns

### 1. Service Integration

#### Direct Service Usage
```typescript
// Inject audit log controller
class FormService {
  constructor(private auditLog: AuditLogController) {}
  
  async updateSchedule(schedule: ScheduleBody, meta: AuditMeta) {
    // Business logic...
    
    await this.auditLog.log({
      actor: meta.actor,
      action: "UPDATE_FORM_SCHEDULE",
      target: { type: "FORM", id: "FORM_CONFIG" },
      changes: {
        before: oldSchedule,
        after: newSchedule
      },
      ip: meta.ip
    });
  }
}
```

#### Middleware Integration
```typescript
// Automatic logging for certain routes
const auditMiddleware = (action: AuditAction, targetType: AuditTarget) =>
  async (context: Context, next: NextFunction) => {
    const result = await next();
    
    // Log the action
    await auditLogController.log({
      actor: { email: context.user.email },
      action,
      target: { type: targetType, id: context.params.id },
      ip: context.ip
    });
    
    return result;
  };
```

### 2. Error Handling Integration

#### Failed Action Logging
```typescript
try {
  await performAction();
} catch (error) {
  // Log failed attempt
  await auditLogController.log({
    actor: meta.actor,
    action: "ACTION_FAILED",
    target: { type: "SYSTEM", id: null },
    changes: {
      error: error.message,
      timestamp: new Date().toISOString()
    },
    ip: meta.ip
  });
  
  throw error;
}
```

### 3. Batch Operation Logging

#### Multiple Actions
```typescript
async processBatch(operations: Operation[], meta: AuditMeta) {
  const results = [];
  
  for (const operation of operations) {
    const result = await processOperation(operation);
    
    // Log individual operation
    await auditLogController.log({
      actor: meta.actor,
      action: operation.type,
      target: { type: "BATCH_OPERATION", id: operation.id },
      ip: meta.ip
    });
    
    results.push(result);
  }
  
  // Log batch summary
  await auditLogController.log({
    actor: meta.actor,
    action: "BATCH_PROCESS_COMPLETE",
    target: { type: "SYSTEM", id: null },
    changes: {
      total: operations.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    ip: meta.ip
  });
  
  return results;
}
```

## Querying and Analysis

### 1. Query Patterns

#### By Actor
```typescript
// Get all actions by specific user
const userActions = await auditLogService.find({
  actor: "user@example.com",
  page: 1,
  limit: 50
});
```

#### By Action Type
```typescript
// Get all candidate submissions
const submissions = await auditLogService.find({
  action: "SUBMIT_CANDIDATE",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-12-31")
});
```

#### By Time Range
```typescript
// Get actions from last 24 hours
const recentActions = await auditLogService.find({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date()
});
```

#### By Target
```typescript
// Get all actions on specific candidate
const candidateHistory = await auditLogService.find({
  targetType: "CANDIDATE",
  targetId: "507f1f77bcf86cd799439011"
});
```

### 2. Index Optimization

#### Created Indexes
```javascript
// Primary indexes
db.audit_logs.createIndex({ createdAt: -1 });
db.audit_logs.createIndex({ "actor.email": 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ "target.type": 1 });
db.audit_logs.createIndex({ "target.id": 1 });

// Compound indexes for common queries
db.audit_logs.createIndex({ 
  "actor.email": 1, 
  createdAt: -1 
});

db.audit_logs.createIndex({ 
  action: 1, 
  createdAt: -1 
});

db.audit_logs.createIndex({ 
  "target.type": 1, 
  "target.id": 1,
  createdAt: -1 
});
```

### 3. Performance Considerations

#### Query Optimization
- Use appropriate indexes
- Limit result sets with pagination
- Project only needed fields
- Use covered queries where possible

#### Storage Optimization
- Regular archiving of old logs
- Compression of change data
- Partitioning by date range
- Cleanup of temporary data

## Security and Compliance

### 1. Security Features

#### Immutable Logs
- Audit logs are append-only
- No update or delete operations
- Cryptographic verification (future enhancement)
- Write-once read-many (WORM) pattern

#### Access Control
- Admin-only access to audit logs
- IP address masking for sensitive operations
- Role-based access to log data
- Audit trail of audit log access

#### Data Protection
- No sensitive data in logs
- IP address anonymization option
- Encryption at rest
- Secure transmission

### 2. Compliance Requirements

#### GDPR Compliance
- Right to be forgotten (log retention policies)
- Data minimization (only necessary data logged)
- Purpose limitation (clear logging purposes)
- Storage limitation (automatic cleanup)

#### Industry Standards
- ISO 27001: Information security management
- SOC 2: Security, availability, processing integrity
- HIPAA: Healthcare data protection (if applicable)
- PCI DSS: Payment card data security

### 3. Retention Policies

#### Default Retention
- **Active logs**: 90 days (immediate access)
- **Archived logs**: 1 year (slower access)
- **Compliance logs**: 7 years (legal requirements)

#### Cleanup Procedures
```typescript
async cleanupOldLogs(retentionDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return await auditLogsCol.deleteMany({
    createdAt: { $lt: cutoffDate.toISOString() }
  });
}
```

## Monitoring and Alerting

### 1. Monitoring Metrics

#### Key Performance Indicators
- **Log volume**: Number of entries per hour/day
- **Log latency**: Time from action to log entry
- **Error rate**: Failed log attempts
- **Storage usage**: Audit log database size

#### Health Checks
```typescript
async checkAuditLogHealth(): Promise<HealthStatus> {
  try {
    // Test write operation
    const testLog = await auditLogService.log({
      actor: { email: "system@health.check" },
      action: "HEALTH_CHECK",
      target: { type: "SYSTEM", id: null },
      ip: "127.0.0.1"
    });
    
    // Test read operation
    const recentLogs = await auditLogService.find({
      limit: 1,
      page: 1
    });
    
    return {
      healthy: true,
      metrics: {
        writeLatency: testLog.latency,
        readLatency: recentLogs.latency,
        storageUsed: await getStorageUsage()
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}
```

### 2. Alerting Rules

#### Critical Alerts
- Audit log service unavailable
- Storage capacity exceeded
- Unusual spike in log volume
- Failed log entries exceeding threshold

#### Warning Alerts
- High latency in log writing
- Approaching storage limits
- Unusual patterns in log data
- Backup failures

### 3. Dashboard and Reporting

#### Built-in Reports
- **Activity summary**: Actions by user/type/time
- **Change history**: Timeline of modifications
- **Compliance reports**: GDPR, security compliance
- **Performance metrics**: System health and usage

#### Custom Queries
```typescript
// Generate custom report
async generateAuditReport(params: ReportParams) {
  const logs = await auditLogService.find(params);
  
  return {
    summary: {
      total: logs.pagination.total,
      byAction: groupBy(logs.data, 'action'),
      byActor: groupBy(logs.data, 'actor.email'),
      byTarget: groupBy(logs.data, 'target.type')
    },
    details: logs.data,
    generatedAt: new Date().toISOString()
  };
}
```

## Troubleshooting

### 1. Common Issues

#### Logging Failures
**Symptoms**:
- Actions not appearing in audit logs
- High error rate in log service
- Performance degradation

**Solutions**:
1. Check MongoDB connection
2. Verify collection permissions
3. Monitor storage capacity
4. Review error logs

#### Performance Issues
**Symptoms**:
- Slow response times when logging
- High database CPU usage
- Timeout errors

**Solutions**:
1. Optimize database indexes
2. Implement batch logging
3. Add query caching
4. Scale database resources

#### Data Integrity Issues
**Symptoms**:
- Missing change tracking data
- Incorrect timestamps
- Duplicate log entries

**Solutions**:
1. Validate input data
2. Implement idempotency checks
3. Add data validation rules
4. Regular data integrity checks

### 2. Diagnostic Tools

#### Log Analysis
```bash
# Get recent audit logs
mongosh cnc-recruit-2026 --eval "
  db.audit_logs.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .pretty()
"

# Check log statistics
mongosh cnc-recruit-2026 --eval "
  db.audit_logs.aggregate([
    { $group: {
      _id: '$action',
      count: { $sum: 1 },
      latest: { $max: '$createdAt' }
    }},
    { $sort: { count: -1 } }
  ])
"
```

#### Performance Monitoring
```bash
# Monitor query performance
mongosh cnc-recruit-2026 --eval "
  db.audit_logs.explain().find({
    createdAt: { $gte: new Date('2024-01-01') }
  })
"

# Check index usage
mongosh cnc-recruit-2026 --eval "
  db.audit