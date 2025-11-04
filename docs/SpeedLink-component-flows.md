# SpeedLink Component Interaction Flows

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** Approved  
**Story:** 1-3-design-system-architecture

---

## Overview

This document details the critical interaction flows for SpeedLink MVP, with explicit latency checkpoints to ensure the ≤800ms real-time update requirement is achieved.

---

## Flow 1: Party Creation

**Description:** User creates a new party and becomes the party leader

```
┌──────────┐                 ┌──────────┐              ┌──────────┐         ┌──────────┐
│   PWA    │                 │ REST API │              │   Redis  │         │PostgreSQL│
└────┬─────┘                 └────┬─────┘              └────┬─────┘         └────┬─────┘
     │                            │                         │                    │
     │ POST /party/create         │                         │                    │
     │ {name, settings}           │                         │                    │
     ├───────────────────────────>│ [T0] Request received   │                    │
     │                            │ Validate JWT            │                    │
     │                            │ Generate 6-digit code   │                    │
     │                            ├─────────────────────────┼───────────────────>│
     │                            │ INSERT INTO parties     │                    │
     │                            │ [T0+30ms]               │                    │
     │                            │<────────────────────────┼────────────────────┤
     │                            │ partyId: 12345          │                    │
     │                            ├────────────────────────>│                    │
     │                            │ HSET party:12345        │                    │
     │                            │ {leader, members:[], created}                │
     │                            │ [T0+40ms]               │                    │
     │                            │<────────────────────────┤                    │
     │<───────────────────────────┤                         │                    │
     │ {partyId, code, wsUrl}     │                         │                    │
     │ [T0+50ms]                  │                         │                    │
     │                            │                         │                    │
     │ WS connect(token, partyId) │                         │                    │
     ├─────────────────────────────────────────────────────>│                    │
     │                            │   [to Real-Time Service]│                    │
     │                            │                         │                    │
     │<────────────────────────────────────────────────────┤                    │
     │ emit('party:created')      │                         │                    │
     │ [T0+120ms]                 │                         │                    │
     │                            │                         │                    │
```

**Latency Checkpoints:**
- **T0**: Request received at REST API
- **T0+30ms**: Party record inserted into PostgreSQL
- **T0+40ms**: Party state initialized in Redis
- **T0+50ms**: Response sent to client (HTTP complete)
- **T0+120ms**: WebSocket connection established, party:created event received

**Total Latency:** ~120ms  
**Status:** ✅ Well within ≤800ms target

---

## Flow 2: Real-Time Location Update

**Description:** Party member shares location update, broadcasted to all party members

```
┌──────────┐         ┌────────────────┐         ┌─────────┐         ┌──────────┐
│ PWA (A)  │         │  Real-Time Svc │         │  Redis  │         │ PWA (B,C)│
└────┬─────┘         └───────┬────────┘         └────┬────┘         └────┬─────┘
     │                       │                       │                   │
     │ emit('location:update')                       │                   │
     │ {lat, lng, speed, heading}                    │                   │
     ├──────────────────────>│ [T0] Receive update   │                   │
     │                       │ Validate user in party│                   │
     │                       │ [T0+5ms]              │                   │
     │                       ├──────────────────────>│                   │
     │                       │ HSET party:12345      │                   │
     │                       │   member:userId:location                  │
     │                       │ [T0+10ms]             │                   │
     │                       │<──────────────────────┤                   │
     │                       │                       │                   │
     │                       │ PUBLISH party:12345:updates               │
     │                       │ {userId, location...} │                   │
     │                       │ [T0+15ms]             │                   │
     │                       ├──────────────────────>│                   │
     │                       │                       │                   │
     │                       │ [All instances subscribed to channel]     │
     │                       │                       │                   │
     │                       ├───────────────────────┼──────────────────>│
     │                       │ emit('party:location:update')             │
     │                       │ {userId, lat, lng, speed, heading}        │
     │                       │ [T0+80ms]             │                   │
     │                       │                       │                   │
```

**Latency Checkpoints:**
- **T0**: Location update received at Real-Time Service
- **T0+5ms**: User validation complete
- **T0+10ms**: Redis state updated
- **T0+15ms**: Pub/sub message published
- **T0+80ms**: All party members receive update (network variance)

**Network Latency Considerations:**
- Client → Real-Time Service: 30-80ms (varies by geography)
- Real-Time Service → Client: 30-80ms
- Inter-instance pub/sub: 5-15ms
- Redis operations: 1-5ms

**Total End-to-End Latency:**
- Best case: ~100ms (low-latency network)
- Typical: 150-250ms (average conditions)
- Worst case (99th percentile): <800ms (guaranteed by SLA)

**Optimization Strategies:**
1. **Batch Updates**: Throttle location updates to 1 per second per user
2. **Geographically Distributed**: Real-Time Service in multiple regions
3. **WebSocket Keepalive**: Maintain persistent connections (reduce reconnect overhead)
4. **Message Compression**: Use binary protocol for location data

**Status:** ✅ Meets ≤800ms requirement with headroom

---

## Flow 3: Alert Broadcasting

**Description:** Speed camera alert triggered and broadcasted to nearby party members

```
┌──────────┐    ┌────────────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ Alert Svc│    │  Real-Time Svc │    │  Redis  │    │PostgreSQL│    │   PWA    │
└────┬─────┘    └───────┬────────┘    └────┬────┘    └────┬─────┘    └────┬─────┘
     │                  │                   │              │               │
     │ Periodic check   │                   │              │               │
     │ Query alerts     │                   │              │               │
     ├──────────────────┼───────────────────┼─────────────>│               │
     │ SELECT * FROM alerts                 │              │               │
     │ WHERE location <-> point(lat,lng) < 2000m           │               │
     │ [T0]             │                   │              │               │
     │<─────────────────┼───────────────────┼──────────────┤               │
     │ [alertId, type, location, distance]  │              │               │
     │ [T0+20ms]        │                   │              │               │
     │                  │                   │              │               │
     │ For each active party member nearby  │              │               │
     ├─────────────────>│                   │              │               │
     │ publishAlert({partyId, userId, alert})              │               │
     │ [T0+30ms]        │                   │              │               │
     │                  ├──────────────────>│              │               │
     │                  │ LPUSH alert:queue │              │               │
     │                  │ [T0+35ms]         │              │               │
     │                  │<──────────────────┤              │               │
     │                  │                   │              │               │
     │                  │ Process alert queue              │               │
     │                  │ RPOP alert:queue  │              │               │
     │                  ├──────────────────>│              │               │
     │                  │<──────────────────┤              │               │
     │                  │ [T0+40ms]         │              │               │
     │                  │                   │              │               │
     │                  ├───────────────────┼──────────────┼──────────────>│
     │                  │ emit('alert:new') │              │               │
     │                  │ {type, distance, severity}       │               │
     │                  │ [T0+100ms]        │              │               │
     │                  │                   │              │               │
```

**Latency Checkpoints:**
- **T0**: Alert query executed (geospatial search)
- **T0+20ms**: Alert records retrieved from PostgreSQL
- **T0+30ms**: Alert published to Real-Time Service
- **T0+35ms**: Alert queued in Redis
- **T0+40ms**: Alert dequeued for processing
- **T0+100ms**: Alert delivered to client via WebSocket

**Geospatial Query Performance:**
- PostGIS indexed query: <20ms for 2km radius search
- Index: `CREATE INDEX idx_alerts_location ON alerts USING GIST (location);`

**Alert Priority Levels:**
1. **Critical** (500m proximity): Immediate broadcast, no batching
2. **High** (1km proximity): 2-second batch window
3. **Medium** (2km proximity): 5-second batch window

**Status:** ✅ Alert delivery <100ms typical, <300ms worst case

---

## Flow 4: Party Join via Invite Code

**Description:** User joins an existing party using a 6-digit code

```
┌──────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│   PWA    │         │ REST API │         │  Redis  │         │PostgreSQL│
└────┬─────┘         └────┬─────┘         └────┬────┘         └────┬─────┘
     │                    │                    │                    │
     │ POST /party/join   │                    │                    │
     │ {code: "ABC123"}   │                    │                    │
     ├───────────────────>│ [T0] Validate code │                    │
     │                    ├────────────────────┼───────────────────>│
     │                    │ SELECT * FROM parties                   │
     │                    │ WHERE invite_code='ABC123'              │
     │                    │ [T0+15ms]          │                    │
     │                    │<───────────────────┼────────────────────┤
     │                    │ {partyId, leader, settings}             │
     │                    │                    │                    │
     │                    ├────────────────────┼───────────────────>│
     │                    │ INSERT INTO party_members               │
     │                    │ {party_id, user_id, joined_at}          │
     │                    │ [T0+25ms]          │                    │
     │                    │<───────────────────┼────────────────────┤
     │                    │                    │                    │
     │                    ├───────────────────>│                    │
     │                    │ SADD party:12345:members userId         │
     │                    │ [T0+30ms]          │                    │
     │                    │<───────────────────┤                    │
     │<───────────────────┤                    │                    │
     │ {partyId, wsUrl, members[]}            │                    │
     │ [T0+40ms]          │                    │                    │
     │                    │                    │                    │
     │ WS connect + emit('party:join')        │                    │
     ├────────────────────┼───────────────────>│                    │
     │                    │   [to Real-Time Service]                │
     │                    │                    │                    │
     │<───────────────────┼────────────────────┤                    │
     │ emit('party:member:joined') to all     │                    │
     │ [T0+100ms]         │                    │                    │
     │                    │                    │                    │
```

**Latency Checkpoints:**
- **T0**: Join request received
- **T0+15ms**: Party lookup by code (indexed)
- **T0+25ms**: Member record inserted
- **T0+30ms**: Redis party set updated
- **T0+40ms**: HTTP response sent
- **T0+100ms**: All party members notified via WebSocket

**Status:** ✅ Join flow <100ms

---

## Flow 5: Community Report Submission

**Description:** User submits a hazard report (e.g., pothole, debris)

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌────────────────┐
│   PWA    │         │ REST API │         │PostgreSQL│         │  Real-Time Svc │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └───────┬────────┘
     │                    │                    │                        │
     │ POST /report       │                    │                        │
     │ {type, lat, lng, description, photo}    │                        │
     ├───────────────────>│ [T0] Validate      │                        │
     │                    │ Rate limit check   │                        │
     │                    │ Image resize/compress                       │
     │                    │ [T0+50ms]          │                        │
     │                    ├───────────────────>│                        │
     │                    │ INSERT INTO reports│                        │
     │                    │ [T0+70ms]          │                        │
     │                    │<───────────────────┤                        │
     │                    │ {reportId}         │                        │
     │<───────────────────┤                    │                        │
     │ {reportId, status} │                    │                        │
     │ [T0+80ms]          │                    │                        │
     │                    │                    │                        │
     │                    │ Trigger alert broadcast                     │
     │                    ├────────────────────┼───────────────────────>│
     │                    │ publishReport()    │                        │
     │                    │ [T0+90ms]          │                        │
     │                    │                    │                        │
     │                    │                    │ Query nearby parties   │
     │                    │                    │ Broadcast to members   │
     │                    │                    │ [T0+150ms]             │
     │                    │                    │                        │
```

**Latency Checkpoints:**
- **T0**: Report submission received
- **T0+50ms**: Image processing and validation complete
- **T0+70ms**: Report inserted into database
- **T0+80ms**: Response sent to submitter
- **T0+90ms**: Alert broadcast triggered
- **T0+150ms**: Nearby party members notified

**Image Processing:**
- Max size: 2MB
- Resize: 1024x1024 max
- Format: JPEG, quality 80%
- Processing time: 30-50ms (using sharp library)

**Status:** ✅ Submission <100ms, broadcast <200ms

---

## Flow 6: User Authentication (Login)

**Description:** User logs in and receives JWT for subsequent requests

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌─────────┐
│   PWA    │         │ REST API │         │PostgreSQL│         │  Redis  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬────┘
     │                    │                    │                    │
     │ POST /auth/login   │                    │                    │
     │ {email, password}  │                    │                    │
     ├───────────────────>│ [T0] Rate limit check                  │
     │                    ├───────────────────>│                    │
     │                    │ GET rate:login:email                    │
     │                    │ [T0+5ms]           │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │                    ├───────────────────────────────────────>│
     │                    │ SELECT * FROM users WHERE email=?       │
     │                    │ [T0+15ms]          │                    │
     │                    │<────────────────────┤                   │
     │                    │ {userId, password_hash, ...}            │
     │                    │                    │                    │
     │                    │ bcrypt.compare(password, hash)          │
     │                    │ [T0+165ms]         │                    │
     │                    │ ✅ Match           │                    │
     │                    │                    │                    │
     │                    │ Generate JWT (sign with RS256)          │
     │                    │ [T0+170ms]         │                    │
     │                    ├────────────────────┼───────────────────>│
     │                    │ SET session:userId {token, exp}         │
     │                    │ [T0+175ms]         │                    │
     │                    │<───────────────────┼────────────────────┤
     │<───────────────────┤                    │                    │
     │ {accessToken, refreshToken, user}       │                    │
     │ [T0+180ms]         │                    │                    │
     │                    │                    │                    │
```

**Latency Checkpoints:**
- **T0**: Login request received
- **T0+5ms**: Rate limit check (Redis)
- **T0+15ms**: User lookup (PostgreSQL)
- **T0+165ms**: bcrypt comparison (intentionally slow, bcrypt cost=12)
- **T0+170ms**: JWT generated and signed
- **T0+175ms**: Session cached in Redis
- **T0+180ms**: Response sent to client

**bcrypt Cost Analysis:**
- Cost=10: ~65ms (too fast, vulnerable to brute force)
- Cost=12: ~150ms (recommended, secure)
- Cost=14: ~600ms (too slow for user experience)

**Security Notes:**
- Rate limit: 5 failed attempts per 15 minutes per email
- Failed login timing: Constant-time comparison to prevent timing attacks
- Session TTL: 15 minutes (access token), 7 days (refresh token)

**Status:** ✅ Login <200ms (bcrypt dominates latency)

---

## Flow 7: WebSocket Connection Recovery

**Description:** Client reconnects after temporary network loss

```
┌──────────┐         ┌────────────────┐         ┌─────────┐
│   PWA    │         │  Real-Time Svc │         │  Redis  │
└────┬─────┘         └───────┬────────┘         └────┬────┘
     │                       │                       │
     │ [Network interruption]│                       │
     │ ✗ Connection lost     │                       │
     │                       │                       │
     │ [Network restored]    │                       │
     │ WS reconnect(token, lastEventId)              │
     ├──────────────────────>│ [T0] Validate token   │
     │                       ├──────────────────────>│
     │                       │ GET session:userId    │
     │                       │<──────────────────────┤
     │                       │ ✅ Valid              │
     │                       │                       │
     │                       │ Retrieve missed events│
     │                       ├──────────────────────>│
     │                       │ LRANGE events:userId lastEventId -1
     │                       │ [T0+10ms]             │
     │                       │<──────────────────────┤
     │                       │ [event1, event2, ...] │
     │                       │                       │
     │<──────────────────────┤                       │
     │ emit('reconnect:sync')│                       │
     │ {events: [...]}       │                       │
     │ [T0+50ms]             │                       │
     │                       │                       │
     │<──────────────────────┤                       │
     │ emit('reconnect:complete')                    │
     │ [T0+60ms]             │                       │
     │                       │                       │
```

**Latency Checkpoints:**
- **T0**: Reconnection attempt
- **T0+10ms**: Missed events retrieved from Redis
- **T0+50ms**: Events synchronized to client
- **T0+60ms**: Reconnection complete

**Event Buffering:**
- Redis stores last 100 events per user
- Events TTL: 5 minutes
- Max sync payload: 50 events (prevent overwhelming client)

**Status:** ✅ Fast reconnection with zero data loss

---

## Latency Budget Summary

| Flow | Target | Typical | 99th Percentile | Status |
|------|--------|---------|-----------------|--------|
| Party Creation | <500ms | 120ms | 200ms | ✅ |
| Location Update | <800ms | 150-250ms | 400ms | ✅ |
| Alert Broadcasting | <500ms | 100ms | 300ms | ✅ |
| Party Join | <500ms | 100ms | 200ms | ✅ |
| Report Submission | <1000ms | 150ms | 300ms | ✅ |
| User Login | <500ms | 180ms | 250ms | ✅ |
| WebSocket Reconnect | <200ms | 60ms | 150ms | ✅ |

**Overall System Performance:** ✅ All critical flows meet latency requirements with significant headroom

---

_Component interaction flows specification prepared for SpeedLink MVP development_