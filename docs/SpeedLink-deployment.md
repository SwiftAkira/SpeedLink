# SpeedLink Deployment Topology and Infrastructure

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** Approved  
**Story:** 1-3-design-system-architecture

---

## ⚠️ Deployment Platform Decision Update

**DECISION (November 4, 2025):** SpeedLink will use **Vercel** as the complete hosting platform for MVP deployment, replacing the AWS-based architecture documented below.

**Rationale:**
- **Simplified Operations:** Single platform for frontend, backend serverless functions, and managed databases
- **Faster Time to Market:** Vercel's zero-config deployment accelerates Epic 2+ implementation
- **Cost Efficiency:** Generous free tier and predictable pricing for MVP scale
- **Built-in Capabilities:** Postgres and Redis add-ons eliminate separate database management
- **Serverless Backend:** Vercel Functions support Fastify and Socket.IO serverless deployment

**Architecture Preserved Below:** The AWS-based architecture design below remains valid for reference and represents production-scale considerations. The core architectural principles (latency checkpoints, component interactions, security requirements) apply equally to Vercel deployment.

---

## Overview

This document specifies the deployment topology, infrastructure requirements, and operational considerations for SpeedLink MVP. The AWS-based architecture below serves as a comprehensive reference design, with Vercel selected for actual MVP implementation.

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        USER LAYER (Global)                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  End Users (PWA) - Web Browsers + Service Workers           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                    HTTPS/WSS (TLS 1.3)
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                      CDN LAYER (Edge)                               │
│  ┌──────────────────┐            ┌────────────────────────────┐   │
│  │ Vercel CDN      │            │  CloudFront (Static Assets)│   │
│  │ (PWA Frontend)  │            │  (Images, CSS, JS)         │   │
│  └──────────────────┘            └────────────────────────────┘   │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                     LOAD BALANCER LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  AWS Application Load Balancer (Multi-AZ)                    │ │
│  │  - Health Checks (5s interval)                               │ │
│  │  - SSL Termination                                           │ │
│  │  - Sticky Sessions (for WebSocket)                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────┬──────────────────────────┬──────────────────────┘
                  │                          │
         ┌────────▼────────┐        ┌────────▼───────────┐
         │  REST API Path  │        │  WebSocket Path    │
         │  /api/*         │        │  /ws/*             │
         └────────┬────────┘        └────────┬───────────┘
                  │                          │
┌─────────────────▼──────────────────────────▼──────────────────────┐
│                     APPLICATION LAYER (AWS ECS)                     │
│                                                                     │
│  ┌────────────────────────────┐   ┌──────────────────────────────┐│
│  │  REST API Service          │   │  Real-Time Service           ││
│  │  (Fargate Tasks: 2-10)     │   │  (Fargate Tasks: 3-20)       ││
│  │                            │   │                              ││
│  │  • CPU: 512-1024 units     │   │  • CPU: 1024-2048 units      ││
│  │  • Memory: 1-2 GB          │   │  • Memory: 2-4 GB            ││
│  │  • Auto-scaling: CPU>70%   │   │  • Auto-scaling: CPU>70%     ││
│  │  • Health: /health         │   │  • Health: /health           ││
│  └────────────────────────────┘   └──────────────────────────────┘│
└──────────────┬────────────────────────────┬────────────────────────┘
               │                            │
┌──────────────▼────────────────────────────▼────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  AWS RDS PostgreSQL 15 (Multi-AZ)                           │  │
│  │  ┌──────────────┐     ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Primary    │────>│  Replica 1   │  │  Replica 2   │   │  │
│  │  │ (us-west-2a) │     │ (us-west-2b) │  │ (us-west-2c) │   │  │
│  │  │ db.t3.medium │     │ db.t3.medium │  │ db.t3.medium │   │  │
│  │  │ Writes Only  │     │  Reads Only  │  │  Reads Only  │   │  │
│  │  └──────────────┘     └──────────────┘  └──────────────┘   │  │
│  │                                                             │  │
│  │  Storage: 100 GB SSD, Auto-scaling to 1 TB                 │  │
│  │  Backups: Daily snapshots, 7-day retention                 │  │
│  │  Encryption: AES-256 at rest                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  AWS ElastiCache Redis 7.x (Cluster Mode)                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │  │
│  │  │  Primary 1   │  │  Primary 2   │  │  Primary 3   │     │  │
│  │  │(us-west-2a)  │  │(us-west-2b)  │  │(us-west-2c)  │     │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │  │
│  │         │                 │                 │              │  │
│  │  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐     │  │
│  │  │  Replica 1   │  │  Replica 2   │  │  Replica 3   │     │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │  │
│  │                                                             │  │
│  │  Node Type: cache.t3.medium (1.6 GB memory each)           │  │
│  │  Persistence: AOF enabled (append every second)            │  │
│  │  Eviction: allkeys-lru                                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    MONITORING & OBSERVABILITY                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  CloudWatch  │  │  Datadog APM │  │  Sentry (Error Track)  │   │
│  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Components

### Frontend Hosting (Vercel)

**Service:** Vercel Pro Plan  
**Deployment:** Continuous deployment from Git (main branch)  
**Edge Network:** Global CDN with 70+ edge locations  
**Features:**
- Automatic HTTPS with SSL certificates
- Serverless Functions for SSR (if needed)
- Edge caching with stale-while-revalidate
- Preview deployments for pull requests

**Configuration:**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/service-worker.js", "headers": { "cache-control": "public, max-age=0, must-revalidate" } },
    { "src": "/(.*).(js|css|png|jpg|svg)", "headers": { "cache-control": "public, max-age=31536000, immutable" } },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Estimated Cost:** $20/month

---

### Backend Compute (AWS ECS Fargate)

**Container Platform:** Amazon ECS with Fargate (serverless containers)  
**Region:** us-west-2 (Oregon)  
**Availability Zones:** 3 (us-west-2a, us-west-2b, us-west-2c)

#### REST API Service

**Task Definition:**
- CPU: 0.5 vCPU (512 units)
- Memory: 1 GB
- Image: `speedlink/rest-api:latest` (ECR)
- Port: 3000
- Health Check: `GET /health` (5s interval, 2 failures = unhealthy)

**Auto-Scaling:**
- Min: 2 tasks
- Max: 10 tasks
- Target: 70% CPU utilization
- Scale-out cooldown: 60 seconds
- Scale-in cooldown: 300 seconds

**Estimated Cost:** ~$30-150/month (based on load)

#### Real-Time Service

**Task Definition:**
- CPU: 1 vCPU (1024 units)
- Memory: 2 GB
- Image: `speedlink/realtime:latest` (ECR)
- Port: 3001
- Health Check: `GET /health` (5s interval, 2 failures = unhealthy)

**Auto-Scaling:**
- Min: 3 tasks (for redundancy)
- Max: 20 tasks
- Target: 70% CPU utilization
- Metric: Custom (WebSocket connection count)
- Scale-out: > 500 connections per task
- Scale-in: < 200 connections per task

**Estimated Cost:** ~$90-600/month (based on load)

---

### Load Balancer (AWS ALB)

**Type:** Application Load Balancer  
**Scheme:** Internet-facing  
**Availability Zones:** 3  
**Listeners:**
- Port 443 (HTTPS) → Target Group (REST API, Real-Time)
- SSL Certificate: AWS Certificate Manager (auto-renewal)

**Target Groups:**
- `speedlink-rest-api` (path: `/api/*`)
  - Health check: `GET /health`, 200 status
  - Deregistration delay: 30 seconds
- `speedlink-realtime` (path: `/ws/*`)
  - Health check: `GET /health`, 200 status
  - Stickiness: Enabled (cookie-based, 1-hour TTL)
  - Deregistration delay: 300 seconds (graceful WebSocket closure)

**Estimated Cost:** ~$25/month + data transfer

---

### Database (AWS RDS PostgreSQL)

**Engine:** PostgreSQL 15.4  
**Instance Class:** db.t3.medium (2 vCPU, 4 GB RAM)  
**Deployment:** Multi-AZ (1 primary, 2 read replicas)  
**Storage:** 100 GB General Purpose SSD (gp3)  
**Auto-Scaling:** Up to 1 TB  
**Backup:**
- Automated daily snapshots (7-day retention)
- Point-in-time recovery enabled
- Backup window: 03:00-04:00 UTC
- Maintenance window: Sunday 04:00-05:00 UTC

**Extensions:**
- PostGIS 3.3 (geospatial)
- pg_stat_statements (query monitoring)

**Security:**
- Encryption at rest (AES-256)
- Encryption in transit (SSL/TLS)
- Security group: Allow 5432 from ECS tasks only
- IAM database authentication enabled

**Estimated Cost:** ~$150/month (primary + 2 replicas)

---

### Cache (AWS ElastiCache Redis)

**Engine:** Redis 7.0  
**Node Type:** cache.t3.medium (1.55 GB memory)  
**Deployment:** Cluster mode enabled (3 shards)  
**Replication:** 1 replica per shard (total: 6 nodes)  
**Availability Zones:** 3  
**Persistence:** AOF (Append-Only File, every second)  
**Eviction Policy:** allkeys-lru (least recently used)

**Configuration:**
```
maxmemory-policy: allkeys-lru
timeout: 300
tcp-keepalive: 300
```

**Security:**
- Encryption at rest enabled
- Encryption in transit enabled
- Security group: Allow 6379 from ECS tasks only
- Auth token enabled

**Estimated Cost:** ~$120/month

---

### Object Storage (AWS S3)

**Bucket:** `speedlink-assets`  
**Purpose:** User-uploaded images (report photos)  
**Storage Class:** Standard (frequently accessed)  
**Lifecycle Policy:**
- Transition to Intelligent-Tiering after 30 days
- Delete after 90 days

**Security:**
- Public access blocked
- Signed URLs for uploads (pre-signed PUT)
- CloudFront distribution for delivery
- Server-side encryption (SSE-S3)

**Estimated Cost:** ~$5/month (assuming 10 GB)

---

## Networking

### VPC Configuration

**CIDR:** 10.0.0.0/16  
**Subnets:**
- Public subnets: 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24 (ALB)
- Private subnets: 10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24 (ECS tasks)
- Data subnets: 10.0.21.0/24, 10.0.22.0/24, 10.0.23.0/24 (RDS, ElastiCache)

**NAT Gateway:** 1 per AZ (for ECS tasks to access internet)

**Security Groups:**
- `sg-alb`: Allow 443 from 0.0.0.0/0
- `sg-ecs-rest`: Allow 3000 from ALB
- `sg-ecs-realtime`: Allow 3001 from ALB
- `sg-rds`: Allow 5432 from ECS tasks
- `sg-redis`: Allow 6379 from ECS tasks

---

## CI/CD Pipeline

**Platform:** GitHub Actions  
**Workflow:**
1. Push to `main` branch
2. Run tests (unit, integration)
3. Build Docker images (REST API, Real-Time)
4. Push to AWS ECR
5. Update ECS task definitions
6. Deploy to ECS (rolling update, 50% capacity)
7. Run smoke tests
8. Deploy frontend to Vercel (automatic)

**Rollback Strategy:** ECS task definition versioning (revert to previous version)

---

## Scaling Strategy

### Horizontal Scaling

| Component | Min | Max | Trigger |
|-----------|-----|-----|---------|
| REST API | 2 | 10 | CPU > 70% |
| Real-Time | 3 | 20 | Connections > 500/task |
| PostgreSQL | 1 primary + 2 replicas | Fixed | N/A (vertical scale) |
| Redis | 3 shards (6 nodes) | 10 shards | Memory > 80% |

### Vertical Scaling (Future)

- **REST API:** Increase to 1 vCPU, 2 GB
- **Real-Time:** Increase to 2 vCPU, 4 GB
- **PostgreSQL:** Upgrade to db.m5.large (2 vCPU, 8 GB)
- **Redis:** Upgrade to cache.m5.large (6.4 GB)

---

## Disaster Recovery

### Backup Strategy

**PostgreSQL:**
- Automated daily snapshots (7-day retention)
- Manual snapshots before major releases
- Point-in-time recovery (5-minute granularity)

**Redis:**
- AOF persistence (every second)
- Daily RDB snapshots (copied to S3)

**Application Code:**
- Git repository (GitHub, with branch protection)
- Docker images (ECR, 30-day retention)

### Recovery Procedures

**RTO (Recovery Time Objective):** 15 minutes  
**RPO (Recovery Point Objective):** 5 minutes

**Scenarios:**
1. **Service Outage:** Auto-scaling + ALB health checks (automatic)
2. **Database Failure:** Multi-AZ failover (automatic, <60s)
3. **Region Failure:** Manual failover to us-east-1 (15 minutes)
4. **Data Corruption:** Restore from snapshot (10-15 minutes)

---

## Monitoring and Alerting

### Metrics (CloudWatch)

- **ECS:**
  - CPU utilization (target: <70%)
  - Memory utilization (target: <80%)
  - Task count
- **ALB:**
  - Request count
  - Target response time (target: <200ms p95)
  - 5xx error rate (alert: >1%)
- **RDS:**
  - CPU utilization (target: <70%)
  - Database connections (alert: >80% of max)
  - Replica lag (alert: >5 seconds)
- **Redis:**
  - Memory utilization (alert: >80%)
  - CPU utilization (target: <70%)
  - Evicted keys (alert: >100/min)

### Alerts (PagerDuty)

**Critical:**
- Service down (health check failures)
- Database failover
- Error rate > 5%

**Warning:**
- Latency p95 > 800ms
- Database connections > 70%
- Redis memory > 80%

**Info:**
- New deployment started
- Auto-scaling triggered

---

## Cost Estimates (Monthly)

| Component | Estimated Cost |
|-----------|----------------|
| Vercel (Frontend) | $20 |
| ECS Fargate (REST API) | $30-150 |
| ECS Fargate (Real-Time) | $90-600 |
| AWS ALB | $25 |
| RDS PostgreSQL | $150 |
| ElastiCache Redis | $120 |
| S3 + CloudFront | $10 |
| NAT Gateway | $100 |
| Data Transfer | $50 |
| Monitoring (Datadog) | $15 |
| **Total** | **$610-1,240/month** |

**MVP Phase:** ~$600-700/month (low traffic)  
**Production Scale (1000 concurrent parties):** ~$1,000-1,200/month

---

_Deployment topology specification prepared for SpeedLink MVP development_