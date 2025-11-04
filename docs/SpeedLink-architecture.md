# SpeedLink System Architecture Specification

**Document Version:** 2.0  
**Date:** November 4, 2025  
**Status:** Approved  
**Story:** 1-3-design-system-architecture

---

## Executive Summary

This document provides the comprehensive system architecture for the SpeedLink MVP, detailing component interactions, data flows, API contracts, database design, deployment topology, and security architecture. All design decisions are optimized for the ≤800ms real-time latency requirement and 1000+ concurrent party scalability target.

---

## 1. System Components and Relationships

### 1.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              PWA Frontend (React + Vite)                    │    │
│  │  • Service Worker (offline support, push notifications)     │    │
│  │  • Mapbox GL JS (interactive map rendering)                 │    │
│  │  • State Management (React Context/Zustand)                 │    │
│  │  • WebSocket Client (Socket.IO client)                      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    HTTPS / WSS (encrypted)
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────────┐     │
│  │  REST API Service    │         │  Real-Time Service        │     │
│  │  (Node.js + Fastify) │         │  (Node.js + Socket.IO)    │     │
│  │                      │         │                            │     │
│  │  • Authentication    │         │  • Party State Manager     │     │
│  │  • User Management   │         │  • Location Broadcaster    │     │
│  │  • Profile CRUD      │         │  • Alert Publisher         │     │
│  │  • Report Submission │         │  • Presence Tracker        │     │
│  │  • Party Metadata    │         │  • Message Router          │     │
│  └──────────────────────┘         └──────────────────────────┘     │
│           ↓ ↑                                  ↓ ↑                   │
└───────────┼─┼──────────────────────────────────┼─┼──────────────────┘
            ↓ ↑                                  ↓ ↑
┌───────────┼─┼──────────────────────────────────┼─┼──────────────────┐
│           ↓ ↑              DATA LAYER          ↓ ↑                   │
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────────┐     │
│  │    PostgreSQL        │←────────│       Redis               │     │
│  │                      │ pub/sub │                            │     │
│  │  • User Profiles     │         │  • Party State (hash)      │     │
│  │  • Party Metadata    │         │  • User Presence (sorted)  │     │
│  │  • Reports           │         │  • Alert Queue (list)      │     │
│  │  • Alerts            │         │  • Session Cache (string)  │     │
│  │  • Audit Logs        │         │  • Pub/Sub Channels        │     │
│  └──────────────────────┘         └──────────────────────────┘     │
│       (Primary + Replica)              (Cluster Mode)                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │  Mapbox API  │  │  Web Push    │  │  Alert Data Feeds    │     │
│  │  (Geocoding, │  │  Service     │  │  (Speed Cameras,     │     │
│  │   Routing)   │  │  (VAPID)     │  │   Traffic, Weather)  │     │
│  └──────────────┘  └──────────────┘  └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Descriptions

#### PWA Frontend (React + Vite)
- **Purpose**: User interface for all SpeedLink functionality
- **Key Technologies**: React 18, Vite, Mapbox GL JS, Socket.IO client
- **Responsibilities**:
  - User authentication and session management
  - Real-time map rendering with party member visualization
  - Party creation, joining, and management UI
  - WebSocket connection management for real-time updates
  - Service worker for offline support and background sync
  - Push notification handling
  - Local state caching for offline operation
- **Communication**: HTTPS to REST API, WSS to Real-Time Service
- **Deployment**: Vercel (CDN-backed, global edge network)

#### REST API Service (Node.js + Fastify)
- **Purpose**: Handle synchronous HTTP operations and persistent data
- **Key Technologies**: Node.js 20 LTS, Fastify, JWT, bcrypt
- **Responsibilities**:
  - User registration and authentication (JWT issuance)
  - Profile CRUD operations
  - Party metadata management (history, settings)
  - Community report submission and validation
  - Alert data retrieval and filtering
  - Rate limiting and input validation
- **Communication**: PostgreSQL for persistence, Redis for caching
- **Deployment**: AWS ECS/Fargate (auto-scaling, 2-10 instances)

#### Real-Time Service (Node.js + Socket.IO)
- **Purpose**: Ultra-low-latency real-time communication for party operations
- **Key Technologies**: Node.js 20 LTS, Socket.IO 4.x, Redis adapter
- **Responsibilities**:
  - WebSocket connection management
  - Party state synchronization across members
  - Location update broadcasting (≤800ms target)
  - Alert publishing to party members
  - Presence tracking (online/offline status)
  - Message routing for in-party chat
  - Connection recovery and state reconciliation
- **Communication**: Redis for pub/sub and state sharing, PostgreSQL for audit
- **Deployment**: AWS ECS/Fargate (auto-scaling, 3-20 instances)
- **Scaling**: Stateless design with Redis adapter for horizontal scaling

#### PostgreSQL Database
- **Purpose**: Persistent storage for relational data
- **Version**: PostgreSQL 15+ with PostGIS extension
- **Responsibilities**:
  - User account storage (hashed passwords, profiles)
  - Party metadata (creation time, leader, settings)
  - Community reports (location, type, votes, timestamps)
  - Alert catalog (speed cameras, persistent hazards)
  - Audit logs for security and debugging
- **Configuration**: 
  - Primary-replica setup (1 primary, 2 read replicas)
  - Automated backups (daily full, hourly incremental)
  - Point-in-time recovery (7-day retention)
- **Deployment**: AWS RDS PostgreSQL (db.t3.medium minimum)

#### Redis Cache and Pub/Sub
- **Purpose**: Real-time state storage and inter-service communication
- **Version**: Redis 7.x
- **Responsibilities**:
  - Party state storage (member list, locations, metadata)
  - User presence tracking (sorted sets by timestamp)
  - Session cache (JWT validation, rate limiting)
  - Pub/sub channels for cross-instance communication
  - Alert queue for async processing
- **Configuration**:
  - Cluster mode (3 primary nodes, 3 replicas)
  - AOF persistence for durability
  - Max memory policy: allkeys-lru
- **Deployment**: AWS ElastiCache Redis (cache.t3.medium minimum)

#### Third-Party Integrations

**Mapbox API**
- Geocoding and reverse geocoding
- Route calculation and optimization
- Map tiles and styling
- Usage: Lazy-loaded, CDN-cached where possible

**Web Push Service**
- VAPID-based push notifications
- Alert delivery when app is backgrounded
- Managed via service worker

**Alert Data Feeds**
- Speed camera databases (static datasets)
- Future: Real-time traffic and weather APIs

### 1.3 Communication Protocols

| Source | Destination | Protocol | Purpose | Latency Target |
|--------|-------------|----------|---------|----------------|
| PWA | REST API | HTTPS | Auth, CRUD operations | <200ms |
| PWA | Real-Time Service | WSS | Location updates, alerts | <100ms |
| REST API | PostgreSQL | TCP | Data persistence | <50ms |
| Real-Time Service | PostgreSQL | TCP | Audit logging | <50ms (async) |
| Real-Time Service | Redis | TCP | State sync, pub/sub | <10ms |
| REST API | Redis | TCP | Session cache | <10ms |
| Real-Time Service Instances | Redis Pub/Sub | TCP | Cross-instance sync | <20ms |

**Total End-to-End Latency Budget (Location Update):**
- Client → Real-Time Service: 50-100ms (network)
- Real-Time Service processing: 10-20ms
- Redis pub/sub: 10-20ms
- Real-Time Service → All clients: 50-100ms (network)
- **Total: 120-240ms typical, <800ms guaranteed (99th percentile)**

---

## 2. Technology Stack (Selected)

### Frontend
- **Framework**: React 18.2+
- **Build Tool**: Vite 5.x
- **State Management**: Zustand (lightweight, performant)
- **Mapping**: Mapbox GL JS 3.x
- **WebSocket**: Socket.IO client 4.x
- **PWA**: vite-plugin-pwa with Workbox
- **Styling**: Tailwind CSS 3.x

### Backend
- **Runtime**: Node.js 20 LTS
- **REST Framework**: Fastify 4.x
- **Real-Time**: Socket.IO 4.x
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **ORM**: Drizzle ORM (type-safe, lightweight)

### Data Layer
- **Primary Database**: PostgreSQL 15+ (with PostGIS)
- **Cache/Pub-Sub**: Redis 7.x
- **Object Storage**: AWS S3 (future: user uploads)

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Compute**: AWS ECS with Fargate
- **Databases**: AWS RDS (PostgreSQL), ElastiCache (Redis)
- **Load Balancing**: AWS Application Load Balancer
- **CDN**: CloudFront (for static assets)
- **Monitoring**: CloudWatch, Datadog
- **CI/CD**: GitHub Actions

---

## 3. Security & Privacy Architecture

### 3.1 Authentication Flow

```
1. User Registration:
   PWA → REST API: POST /auth/register {email, password}
   REST API: Hash password (bcrypt, cost=12)
   REST API → PostgreSQL: INSERT INTO users
   REST API → PWA: {userId, accessToken (JWT), refreshToken}

2. User Login:
   PWA → REST API: POST /auth/login {email, password}
   REST API: Validate credentials, check hash
   REST API: Generate JWT (15min expiry) + Refresh Token (7d expiry)
   REST API → Redis: Cache session (SET session:{userId})
   REST API → PWA: {accessToken, refreshToken, user}

3. WebSocket Authentication:
   PWA → Real-Time Service: connect() with query: {token: JWT}
   Real-Time Service: Verify JWT signature
   Real-Time Service → Redis: CHECK session:{userId}
   Real-Time Service: Accept connection, store userId mapping

4. Token Refresh:
   PWA → REST API: POST /auth/refresh {refreshToken}
   REST API: Validate refresh token
   REST API: Issue new accessToken
   REST API → PWA: {accessToken}
```

**JWT Payload:**
```json
{
  "userId": 12345,
  "email": "user@example.com",
  "iat": 1699123456,
  "exp": 1699124356
}
```

**Security Properties:**
- Access tokens: Short-lived (15 minutes)
- Refresh tokens: Stored in httpOnly cookies
- JWT signing: RS256 (asymmetric) with key rotation every 90 days
- Session invalidation: Redis-backed revocation list

### 3.2 Encryption

**Data in Transit:**
- All client-server: TLS 1.3 (HTTPS/WSS)
- Certificate: AWS Certificate Manager (auto-renewal)
- Cipher suites: Modern, Forward Secrecy enabled

**Data at Rest:**
- PostgreSQL: AES-256 encryption (AWS RDS)
- Redis: Encryption at rest (AWS ElastiCache)
- S3 buckets: Server-side encryption (SSE-S3)
- Sensitive fields (emails, optional): Column-level encryption

### 3.3 Privacy Controls

**User Data Minimization:**
- Location data: Not stored persistently (only in Redis, 24h TTL)
- Party history: Anonymized routes only (no raw location logs)
- Report geolocation: Coarse-grained (100m accuracy)

**GDPR Compliance:**
- Right to access: Export user data via API
- Right to deletion: Cascade delete on user account removal
- Right to rectification: Profile update endpoints
- Data portability: JSON export format

**Opt-In Requirements:**
- Location sharing: Explicit consent on party join
- Push notifications: Browser permission required
- Community reports: Anonymous by default option

### 3.4 Rate Limiting and Abuse Prevention

| Endpoint/Event | Rate Limit | Window |
|----------------|------------|--------|
| POST /auth/login | 5 attempts | 15 minutes |
| POST /auth/register | 3 attempts | 1 hour |
| POST /report | 10 reports | 1 hour |
| WebSocket location update | 10 updates | 1 second |
| WebSocket message | 20 messages | 1 minute |

**Implementation:** Redis-backed sliding window counters

**Abuse Detection:**
- Anomalous location updates (impossible speeds)
- Spam report detection (duplicate content, high frequency)
- Bot detection (CAPTCHA on registration)

---

## 4. Scalability & Reliability

### 4.1 Horizontal Scaling Strategy

**Real-Time Service:**
- Stateless design (all state in Redis)
- Socket.IO Redis adapter for cross-instance pub/sub
- Auto-scaling: CPU > 70% triggers scale-up (max 20 instances)
- Load balancing: Sticky sessions (by userId hash)

**REST API Service:**
- Stateless (JWT-based auth)
- Auto-scaling: Request count > 1000/min per instance
- Load balancing: Round-robin

**Database Read Scaling:**
- PostgreSQL read replicas (2 replicas)
- Read queries routed to replicas
- Primary for writes only

**Redis Cluster:**
- 3 primary nodes (sharded by key)
- 3 replica nodes (1 per primary)
- Automatic failover (Redis Sentinel)

### 4.2 Failover and High Availability

**Service Availability:**
- Multi-AZ deployment (2+ availability zones)
- Health checks: /health endpoint (5s interval)
- Automatic instance replacement on failure

**Database Failover:**
- PostgreSQL: Automatic failover to replica (<60s downtime)
- Redis: Automatic failover via Sentinel (<10s downtime)

**Data Durability:**
- PostgreSQL: Daily full backups + continuous WAL archiving
- Redis: AOF persistence (append every second)

**Disaster Recovery:**
- RTO (Recovery Time Objective): <15 minutes
- RPO (Recovery Point Objective): <5 minutes

### 4.3 Performance Optimization

**Frontend:**
- Code splitting (React.lazy, route-based)
- Service worker caching (static assets: 7d TTL)
- Mapbox tile caching
- WebSocket message batching (location updates: 1s intervals)

**Backend:**
- Database connection pooling (10-50 connections per instance)
- Redis pipelining for batch operations
- Fastify route caching for static responses
- Lazy loading of Mapbox tiles

**Database:**
- Indexes on high-frequency queries (user_id, party_id, location)
- Materialized views for analytics queries
- Query result caching (Redis, 5min TTL)

### 4.4 Monitoring and Observability

**Metrics:**
- WebSocket latency (p50, p95, p99)
- API response times
- Database query performance
- Error rates (4xx, 5xx)
- Active WebSocket connections
- Party sizes and locations

**Logging:**
- Structured JSON logs (Winston)
- Centralized: CloudWatch Logs
- Retention: 30 days

**Alerting:**
- Latency p99 > 800ms
- Error rate > 1%
- Database connection pool exhaustion
- Redis memory > 80%

**Tools:**
- Application: Datadog APM
- Infrastructure: AWS CloudWatch
- Error tracking: Sentry

---

_Comprehensive architecture specification prepared for SpeedLink MVP development_