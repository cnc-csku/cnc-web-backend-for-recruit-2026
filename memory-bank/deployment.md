# Deployment Procedures

## Overview
This document covers deployment procedures for the CNC Recruit 2026 Backend API. The system supports both development and production environments using Docker Compose.

## Prerequisites

### System Requirements
- **Docker**: Version 20.10+ with Docker Compose
- **Disk Space**: Minimum 2GB for containers and data
- **Memory**: Minimum 2GB RAM
- **Network**: Ports 3000, 27017, 9000 available

### Software Dependencies
- Docker Engine
- Docker Compose
- Git (for cloning repository)
- Make (optional, for convenience commands)

## Environment Configuration

### 1. Environment Files

#### Development (`.env`)
```bash
# Application
NODE_ENV=development
ELYSIA_PORT=3000
NEXTAUTH_SECRET=your-development-jwt-secret-here-min-32-chars

# MongoDB
MONGO_URI=mongodb://mongo:27017?replicaSet=rs0
MONGO_DB_NAME=cnc-recruit-2026-dev

# S3/MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=cnc-recruit-2026
S3_USE_SSL=false
```

#### Production (`.env.prod`)
```bash
# Application
NODE_ENV=production
ELYSIA_PORT=3000
NEXTAUTH_SECRET=your-production-jwt-secret-here-min-32-chars

# MongoDB (external service)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=cnc-recruit-2026

# S3 (AWS or compatible)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=cnc-recruit-2026-production
S3_USE_SSL=true
```

### 2. Security Notes
- **Never commit** `.env` or `.env.prod` files to version control
- Use strong, random strings for `NEXTAUTH_SECRET`
- Rotate secrets periodically in production
- Use different credentials for development and production

## Development Deployment

### 1. Using Make Commands

#### Start Development Environment
```bash
make dev
```
**What this does**:
1. Starts MongoDB with replica set
2. Starts MinIO for file storage
3. Builds and starts the application
4. Runs Bun in watch mode for hot reload

#### Stop Development Environment
```bash
make cleardev
```
**Warning**: This removes all MongoDB data

#### Check Container Status
```bash
docker compose -f ./dev.docker-compose.yaml ps
```

### 2. Manual Docker Compose

#### Start Services
```bash
docker compose -f ./dev.docker-compose.yaml up -d --build
```

#### View Logs
```bash
# Application logs
docker compose -f ./dev.docker-compose.yaml logs app

# All logs
docker compose -f ./dev.docker-compose.yaml logs -f

# MongoDB logs
docker compose -f ./dev.docker-compose.yaml logs mongo
```

#### Stop Services
```bash
docker compose -f ./dev.docker-compose.yaml down
```

#### Remove Volumes (Clean Data)
```bash
docker compose -f ./dev.docker-compose.yaml down -v
```

### 3. Development Environment Structure

#### Running Containers
- **app**: Application server (port 3000)
- **mongo**: MongoDB with replica set (port 27017)
- **minio**: S3-compatible storage (port 9000)

#### Access Points
- **API**: http://localhost:3000
- **OpenAPI Docs**: http://localhost:3000/openapi
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)
- **Mongo Express**: http://localhost:8081 (optional)

### 4. Development Workflow

#### Code Changes
1. Make changes to source files
2. Bun automatically restarts the application
3. Changes are reflected immediately

#### Database Changes
1. Connect to MongoDB: `mongosh mongodb://localhost:27017`
2. Use database: `use cnc-recruit-2026-dev`
3. View collections: `show collections`

#### File Storage
1. Access MinIO console at http://localhost:9001
2. Login with `minioadmin` / `minioadmin`
3. Browse `cnc-recruit-2026` bucket

## Production Deployment

### 1. Using Make Commands

#### Deploy to Production
```bash
make prod
```
**What this does**:
1. Builds production Docker image
2. Starts application container
3. Uses external MongoDB and S3 services

#### Stop Production
```bash
make clearprod
```
**Warning**: This stops the application container

### 2. Manual Production Deployment

#### Build Production Image
```bash
docker build -t cnc-recruit-backend:latest .
```

#### Run Production Container
```bash
docker run -d \
  --name cnc-recruit-backend \
  --env-file .env.prod \
  -p 3000:3000 \
  cnc-recruit-backend:latest
```

#### Using Docker Compose (Production)
```bash
docker compose --env-file .env.prod -f ./prod.docker-compose.yaml up -d --build
```

### 3. Production Environment Structure

#### Required External Services
1. **MongoDB**: Atlas cluster or self-hosted replica set
2. **S3 Storage**: AWS S3, DigitalOcean Spaces, or MinIO
3. **Reverse Proxy**: Nginx or Traefik (recommended)
4. **SSL Certificate**: Let's Encrypt or commercial CA

#### Recommended Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│   Application   │───▶│    MongoDB      │
│   (Nginx)       │    │   Containers    │    │    Cluster      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SSL/TLS       │    │   S3 Storage    │    │   Backup        │
│   Termination   │    │   (External)    │    │   System        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4. Production Configuration

#### Dockerfile Optimization
```dockerfile
# Multi-stage build for smaller image
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .
RUN bun build ./src/index.ts --outdir ./dist

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN bun install --production
CMD ["bun", "run", "dist/index.js"]
```

#### Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

#### Resource Limits
```yaml
# In docker-compose.yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## Database Setup

### 1. MongoDB Development Setup

#### Replica Set Configuration
The development environment automatically configures a MongoDB replica set with:
- Single node replica set (`rs0`)
- OpLog enabled for change streams
- No authentication (development only)

#### Initialization Script (`mongo-init.sh`)
```bash
#!/bin/bash
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'localhost:27017' }]
})"
```

### 2. MongoDB Production Setup

#### Recommended Configuration
- **Atlas Cluster**: M10 tier or higher
- **Replica Set**: 3 nodes minimum
- **Backup**: Daily automated backups
- **Monitoring**: Atlas monitoring enabled

#### Connection String
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/cnc-recruit-2026?retryWrites=true&w=majority
```

#### Index Creation
```javascript
// Recommended indexes for production
db.candidates.createIndex({ email: 1 }, { unique: true });
db.candidates.createIndex({ nisitId: 1 }, { unique: true });
db.candidates.createIndex({ interviewStatus: 1 });
db.candidates.createIndex({ createdAt: -1 });

db.audit_logs.createIndex({ createdAt: -1 });
db.audit_logs.createIndex({ "actor.email": 1 });
db.audit_logs.createIndex({ action: 1 });

db.interview_slot.createIndex({ startTime: 1 });
db.interview_slot.createIndex({ status: 1 });
```

### 3. Database Migration

#### Schema Changes
1. Add new fields with default values
2. Update TypeScript interfaces
3. Update validation schemas
4. Deploy application update
5. Run data migration script if needed

#### Data Migration Example
```javascript
// Add new field to all candidates
db.candidates.updateMany(
  {},
  { $set: { newField: "defaultValue" } }
);
```

## Storage Setup

### 1. MinIO Development Setup

#### Default Credentials
- **Endpoint**: http://localhost:9000
- **Access Key**: minioadmin
- **Secret Key**: minioadmin
- **Console**: http://localhost:9001

#### Bucket Creation
Automatically created by bootstrap process with:
- Public read policy for `cnc-profile/` prefix
- Private access for other prefixes

### 2. S3 Production Setup

#### AWS S3 Configuration
1. Create S3 bucket: `cnc-recruit-2026-production`
2. Enable versioning
3. Configure lifecycle policies
4. Enable server-side encryption
5. Set up CORS policy

#### CORS Policy Example
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://your-domain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### IAM Policy for Application
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cnc-recruit-2026-production",
        "arn:aws:s3:::cnc-recruit-2026-production/*"
      ]
    }
  ]
}
```

## Monitoring and Logging

### 1. Application Logs

#### Development Logging
- Console output with timestamps
- Different log levels (info, warn, error)
- Request/response logging

#### Production Logging
```bash
# View container logs
docker logs cnc-recruit-backend

# Follow logs
docker logs -f cnc-recruit-backend

# Log aggregation (recommended)
# - ELK Stack (Elasticsearch, Logstash, Kibana)
# - Loki + Grafana
# - CloudWatch (AWS)
```

### 2. Health Monitoring

#### Built-in Health Check
```
GET /health
```
**Response**: `{ "ok": true }`

#### External Monitoring
- **Uptime Robot**: HTTP monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization

### 3. Performance Metrics

#### Key Metrics to Monitor
- Request rate and response times
- Database connection pool usage
- S3 upload/download performance
- Memory and CPU usage
- Error rates

## Backup and Recovery

### 1. Database Backup

#### MongoDB Backup (Atlas)
- Automated daily backups
- Point-in-time recovery
- Cross-region replication

#### Manual Backup
```bash
# Export data
mongodump --uri="mongodb://localhost:27017" --db=cnc-recruit-2026 --out=./backup

# Import data
mongorestore --uri="mongodb://localhost:27017" ./backup
```

### 2. File Storage Backup

#### S3 Versioning
- Enable versioning on bucket
- Automatic retention of file versions
- Protection against accidental deletion

#### Cross-Region Replication
- Replicate critical files to another region
- Disaster recovery capability

### 3. Configuration Backup

#### Critical Files
- Environment variables (`.env.prod`)
- Docker Compose files
- SSL certificates
- Database connection strings

#### Backup Strategy
1. Daily automated backups
2. Encrypted storage
3. Multiple locations
4. Regular restoration testing

## Scaling

### 1. Horizontal Scaling

#### Application Tier
```yaml
# docker-compose.yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
  restart_policy:
    condition: on-failure
```

#### Load Balancer Configuration
```nginx
# Nginx configuration
upstream backend {
  server app1:3000;
  server app2:3000;
  server app3:3000;
}

server {
  listen 80;
  server_name api.your-domain.com;
  
  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### 2. Database Scaling

#### Read Replicas
- Configure MongoDB read preferences
- Distribute read load
- Improve query performance

#### Sharding (Future)
- Horizontal partitioning of data
- Required for very large datasets
- Complex setup and management

### 3. Storage Scaling

#### S3 Scaling
- Automatic scaling with usage
- No capacity planning required
- Pay-per-use pricing

#### CDN Integration
- CloudFront for public images
- Global edge locations
- Reduced latency

## Security Hardening

### 1. Container Security

#### Best Practices
- Run as non-root user
- Use minimal base images
- Regular vulnerability scanning
- Update dependencies regularly

#### Docker Security Scanning
```bash
# Scan image for vulnerabilities
docker scan cnc-recruit-backend:latest
```

### 2. Network Security

#### Firewall Rules
- Restrict access to necessary ports only
- Use security groups (cloud) or iptables (on-prem)
- Implement network segmentation

#### SSL/TLS Configuration
- Use Let's Encrypt for free certificates
- Enable HTTP/2
- Configure strong cipher suites
- Implement HSTS

### 3. Application Security

#### Environment Variables
- Never hardcode secrets
- Use secret management (Docker Secrets, AWS Secrets Manager)
- Regular rotation of credentials

#### Rate Limiting
- Already implemented (100 requests/minute)
- Consider IP-based blocking for abuse
- Monitor for DDoS attacks

## Troubleshooting

### 1. Common Issues

#### Application Won't Start
**Check**:
- Environment variables are set
- MongoDB is accessible
- S3 credentials are valid
- Port 3000 is available

#### Database Connection Issues
**Check**:
- MongoDB connection string
- Network connectivity
- Authentication credentials
- Replica set status

#### File Upload Failing
**Check**:
- S3 endpoint accessibility
- Bucket permissions
- CORS configuration
- File size limits

### 2. Diagnostic Commands

#### Container Diagnostics
```bash
# Check container status
docker ps

# View container logs
docker logs <container_id>

# Execute shell in container
docker exec -it <container_id> sh

# Check resource usage
docker stats
```

#### Network Diagnostics
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017"

# Test S3 connection
curl http://localhost:9000/minio/health/live

# Test application health
curl http://localhost:3000/health
```

### 3. Recovery Procedures

#### Application Crash
1. Check logs for error messages
2. Restart container: `docker restart <container_id>`
3. Scale up additional instances if needed
4. Investigate root cause

#### Database Issues
1. Check MongoDB logs
2. Verify replica set status
3. Restore from backup if needed
4. Contact database administrator

#### Storage Issues
1. Check S3/MinIO status
2. Verify bucket permissions
3. Check network connectivity
4. Implement fallback storage

## Maintenance

### 1. Regular Maintenance Tasks

#### Daily
- Check application logs for errors
- Monitor resource usage
- Verify backup completion

#### Weekly
- Update dependencies
- Review security logs
- Clean up temporary files

#### Monthly
- Rotate credentials
- Update SSL certificates
- Review and update documentation

### 2. Update Procedures

#### Application Updates
1. Pull latest code changes
2. Update dependencies: `bun install`
3. Build new Docker image
4. Deploy with zero-downtime strategy

#### Database Updates
1. Backup current data
2. Apply schema changes
3. Test with staging data
4. Deploy to production

### 3. Disaster Recovery

#### Recovery Plan
1. Identify failure type (app, db, storage)
2. Activate backup systems
3. Restore from latest backup
4. Verify system functionality
5. Document incident and lessons learned

#### Recovery Time Objectives
- **Application**: 5 minutes (container restart)
- **Database**: 30 minutes (backup restore)
- **Storage**: 15 minutes