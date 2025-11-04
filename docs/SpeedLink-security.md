# SpeedLink Security Architecture

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** Approved  
**Story:** 1-3-design-system-architecture

---

## Overview

This document defines the comprehensive security architecture for SpeedLink MVP, covering authentication, authorization, encryption, privacy controls, and threat mitigation strategies.

---

## Authentication and Authorization

### Authentication Flow

**Primary Method:** JWT (JSON Web Tokens) with RS256 signing

```
┌────────────┐         ┌─────────────┐         ┌──────────┐
│   Client   │         │  REST API   │         │ Database │
└─────┬──────┘         └──────┬──────┘         └────┬─────┘
      │                       │                     │
      │ POST /auth/register   │                     │
      │ {email, password}     │                     │
      ├──────────────────────>│                     │
      │                       │ bcrypt hash         │
      │                       │ (cost=12, ~150ms)   │
      │                       │                     │
      │                       │ INSERT user         │
      │                       ├────────────────────>│
      │                       │<────────────────────┤
      │                       │                     │
      │                       │ Generate JWT        │
      │                       │ Sign with RS256     │
      │                       │ Private Key         │
      │                       │                     │
      │<──────────────────────┤                     │
      │ {accessToken,         │                     │
      │  refreshToken}        │                     │
      │                       │                     │
      │ Subsequent requests   │                     │
      │ Authorization: Bearer │                     │
      │ <accessToken>         │                     │
      ├──────────────────────>│                     │
      │                       │ Verify signature    │
      │                       │ Check expiry        │
      │                       │ Check revocation    │
      │                       │                     │
      │<──────────────────────┤                     │
      │ Protected resource    │                     │
```

### Token Structure

**Access Token (JWT):**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2025-11"
  },
  "payload": {
    "sub": "12345",
    "email": "user@example.com",
    "iat": 1699123456,
    "exp": 1699124356,
    "iss": "speedlink-api",
    "aud": "speedlink-client"
  },
  "signature": "..."
}
```

**Properties:**
- **Expiry:** 15 minutes (short-lived)
- **Algorithm:** RS256 (asymmetric, public/private key pair)
- **Key Rotation:** Every 90 days (automated)
- **Claims:** Minimal (userId, email, timestamps only)

**Refresh Token:**
- **Format:** Opaque random string (64 bytes, base64url-encoded)
- **Storage:** Database (hashed with SHA-256)
- **Expiry:** 7 days
- **Reuse:** Single-use (invalidated after refresh)
- **Rotation:** New refresh token issued on each use

### WebSocket Authentication

**Connection:**
```javascript
const socket = io('wss://realtime.speedlink.app', {
  query: { token: accessToken },
  transports: ['websocket']
});
```

**Server Verification:**
1. Extract token from query parameter
2. Verify JWT signature (RS256 public key)
3. Check expiration timestamp
4. Validate userId claim
5. Check session revocation list (Redis)
6. Accept or reject connection

**Token Refresh:** Client must reconnect with new token after expiry

---

## Encryption

### Data in Transit

**TLS Configuration:**
- **Protocol:** TLS 1.3 (minimum TLS 1.2)
- **Certificate:** AWS Certificate Manager (auto-renewal)
- **Cipher Suites:**
  - `TLS_AES_128_GCM_SHA256`
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_CHACHA20_POLY1305_SHA256`
- **Key Exchange:** ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)
- **Forward Secrecy:** Enabled

**HSTS (HTTP Strict Transport Security):**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**WebSocket Security:**
- **Protocol:** WSS (WebSocket Secure)
- **TLS:** Same configuration as HTTPS
- **Origin Validation:** Whitelist allowed origins

### Data at Rest

**Database (PostgreSQL):**
- **Encryption:** AES-256 (AWS RDS default)
- **Key Management:** AWS KMS (Key Management Service)
- **Key Rotation:** Automatic (yearly)
- **Sensitive Fields:** Column-level encryption for emails (optional)

**Cache (Redis):**
- **Encryption:** AES-256 (ElastiCache default)
- **Key Management:** AWS KMS
- **Data Lifetime:** Short-lived (5-60 minutes TTL)

**Object Storage (S3):**
- **Encryption:** SSE-S3 (Server-Side Encryption)
- **Algorithm:** AES-256
- **Key Management:** AWS-managed keys

**Backups:**
- **PostgreSQL Snapshots:** Encrypted with KMS
- **Redis Snapshots:** Encrypted with KMS

### Password Hashing

**Algorithm:** bcrypt  
**Cost Factor:** 12 (2^12 iterations, ~150ms)  
**Salt:** Unique per password (automatically generated by bcrypt)

**Example:**
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Registration
const hash = await bcrypt.hash(plainPassword, saltRounds);
// Store hash in database

// Login
const match = await bcrypt.compare(plainPassword, hash);
```

**Why bcrypt:**
- Adaptive (cost can be increased over time)
- Resistant to brute-force attacks
- Includes salt automatically
- Industry standard

---

## Privacy Controls

### Location Data Handling

**Real-Time Sharing:**
- Location data stored only in Redis (ephemeral)
- TTL: 5 minutes (auto-deleted)
- Not persisted to PostgreSQL unless explicitly needed
- Shared only with party members (explicit consent)

**Party History:**
- Routes stored as anonymized polylines (no individual tracking)
- Coarse-grained timestamps (hourly, not per-second)
- User can delete party history at any time

**Opt-Out:**
- User can set `is_visible = false` in party settings
- Location updates still sent (for alerting) but not shared with others
- Display name hidden, replaced with "Anonymous Member"

### GDPR Compliance

**Right to Access:**
- Endpoint: `GET /user/data-export`
- Returns JSON with all user data (profile, reports, party history)

**Right to Deletion:**
- Endpoint: `DELETE /user/account`
- Soft delete (mark `deleted_at`)
- Hard delete after 90 days (automated job)
- Cascade delete: Reports, party memberships

**Right to Rectification:**
- Endpoint: `PUT /user/profile`
- User can update display name, vehicle type, preferences

**Right to Portability:**
- Data export in machine-readable JSON format

**Consent Management:**
- Location sharing: Explicit consent on party join
- Push notifications: Browser permission required
- Community reports: Optional (anonymous by default)

### Data Minimization

**Collected Data:**
- Email (required for login)
- Password (hashed, never stored plain)
- Display name (optional, defaults to email prefix)
- Vehicle type (optional)
- Location (real-time only, ephemeral)

**NOT Collected:**
- Full name (unless user provides as display name)
- Phone number
- Payment information (MVP is free)
- Social media profiles
- Device identifiers (except for push notifications)

---

## Security Headers

**HTTP Response Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://api.mapbox.com; connect-src 'self' https://api.mapbox.com wss://realtime.speedlink.app; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://api.mapbox.com
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=()
```

---

## Threat Mitigation

### Rate Limiting

**Strategy:** Sliding window counters in Redis

| Endpoint/Action | Limit | Window | Bucket Key |
|-----------------|-------|--------|------------|
| POST /auth/login | 5 attempts | 15 minutes | IP + email |
| POST /auth/register | 3 attempts | 1 hour | IP |
| POST /report | 10 reports | 1 hour | userId |
| WebSocket location update | 10 updates | 1 second | userId |
| WebSocket message | 20 messages | 1 minute | userId + partyId |

**Implementation:**
```javascript
const redis = require('redis');

async function checkRateLimit(key, limit, window) {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }
  if (current > limit) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
}
```

**Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 300
  }
}
```

### Input Validation

**Framework:** Zod (TypeScript-first schema validation)

**Example:**
```typescript
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  displayName: z.string().max(100).optional()
});

app.post('/auth/register', async (req, res) => {
  const data = RegisterSchema.parse(req.body); // Throws if invalid
  // ...
});
```

**Rules:**
- Email: Valid format, max 255 characters
- Password: 8-100 characters, no composition requirements (modern NIST guidelines)
- Display name: Max 100 characters, sanitize HTML
- Location: Lat (-90 to 90), Lng (-180 to 180)
- Speed: 0-100 m/s (sanity check)

### SQL Injection Prevention

**ORM:** Drizzle ORM (parameterized queries)

**Example:**
```typescript
import { users } from './schema';

// Safe (parameterized)
const user = await db.select()
  .from(users)
  .where(eq(users.email, email));

// NEVER do this:
// const user = await db.execute(`SELECT * FROM users WHERE email = '${email}'`);
```

### XSS Prevention

**Frontend:**
- React's default escaping (JSX auto-escapes)
- DOMPurify for sanitizing user-generated HTML (if needed)

**Backend:**
- Never render user input as HTML
- Use `Content-Type: application/json` (not HTML)

### CSRF Protection

**Not Required for MVP:**
- JWT-based authentication (no cookies)
- WebSocket connections (token in query, not cookie)

**If Cookies Used in Future:**
- SameSite=Strict attribute
- CSRF tokens for state-changing requests

### Clickjacking Prevention

**Header:** `X-Frame-Options: DENY`  
**CSP:** `frame-ancestors 'none'`

### DDoS Mitigation

**Layers:**
1. **CloudFront/Vercel:** Built-in DDoS protection
2. **AWS Shield Standard:** Automatic (included with ALB)
3. **Rate Limiting:** Application-layer (REST API, WebSocket)
4. **Auto-Scaling:** Absorb traffic spikes

**Future:** AWS Shield Advanced ($3,000/month, overkill for MVP)

### Bot Detection

**Registration:**
- CAPTCHA (hCaptcha or reCAPTCHA v3)
- Triggered after 3 failed attempts or suspicious behavior

**Report Submission:**
- Rate limiting (10 reports/hour)
- Duplicate content detection (hashing)
- Anomaly detection (impossible locations, speeds)

### Anomaly Detection

**Location Updates:**
- Impossible speed detection (> 200 km/h sustained)
- Teleportation detection (distance / time > max speed)
- Action: Flag for review, temporary ban

**Report Spam:**
- Duplicate content (same location, type, description)
- High frequency (> 10 reports in 10 minutes)
- Action: Quarantine reports, flag user

---

## Audit Logging

**Logged Events:**
- User registration
- User login (success/failure)
- Password changes
- Party creation
- Report submission
- Admin actions (future)

**Log Format (JSON):**
```json
{
  "timestamp": "2025-11-04T15:30:00Z",
  "eventType": "USER_LOGIN",
  "userId": 12345,
  "ip": "203.0.113.45",
  "userAgent": "Mozilla/5.0...",
  "result": "SUCCESS",
  "metadata": {}
}
```

**Storage:**
- PostgreSQL `audit_logs` table
- Retention: 90 days
- Indexed by userId, eventType, timestamp

**Monitoring:**
- Suspicious patterns (multiple failed logins)
- Account takeover attempts
- Data exfiltration (mass data exports)

---

## Incident Response

### Security Incident Categories

**Severity Levels:**
1. **Critical:** Active breach, data exposure
2. **High:** Vulnerability with exploit available
3. **Medium:** Vulnerability without known exploit
4. **Low:** Minor security issue, no immediate risk

### Response Procedures

**Phase 1: Detection (< 15 minutes)**
- Automated alerts (Datadog, Sentry)
- Manual reports (users, security researchers)
- Verification of incident

**Phase 2: Containment (< 1 hour)**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs (WAF rules)
- Preserve evidence (logs, snapshots)

**Phase 3: Eradication (< 4 hours)**
- Identify root cause
- Patch vulnerability
- Remove attacker access
- Deploy fixes

**Phase 4: Recovery (< 8 hours)**
- Restore services
- Verify integrity
- Monitor for re-infection

**Phase 5: Post-Incident (< 1 week)**
- Post-mortem report
- Update security procedures
- Notify affected users (if required)

### Communication Plan

**Internal:**
- Slack: #security-incidents channel
- PagerDuty: On-call engineer
- Email: security@speedlink.app

**External (if data breach):**
- Affected users: Email notification within 72 hours (GDPR requirement)
- Public disclosure: Security page on website

---

## Vulnerability Management

**Dependency Scanning:**
- Tool: npm audit, Snyk
- Frequency: Daily (automated in CI/CD)
- Action: Auto-create issues for high/critical

**Security Patching:**
- Critical vulnerabilities: Patch within 24 hours
- High vulnerabilities: Patch within 7 days
- Medium vulnerabilities: Patch within 30 days

**Penetration Testing:**
- Internal: Quarterly
- External: Before major releases
- Bug bounty program (future consideration)

---

## Compliance and Standards

**Standards Followed:**
- OWASP Top 10 (Web Application Security)
- NIST Cybersecurity Framework
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)

**Certifications (Future):**
- SOC 2 Type II (when enterprise customers)
- ISO 27001 (international standard)

---

_Security architecture specification prepared for SpeedLink MVP development_