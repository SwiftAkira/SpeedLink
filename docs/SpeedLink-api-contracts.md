# SpeedLink API Contracts Specification

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** Approved  
**Story:** 1-3-design-system-architecture

---

## Overview

This document defines all API contracts for SpeedLink MVP, including REST endpoints and WebSocket events.

---

## REST API Endpoints

**Base URL:** `https://api.speedlink.app/v1`  
**Authentication:** Bearer JWT in Authorization header  
**Content-Type:** `application/json`

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "display_name": "John Doe" (optional)
}
```

**Response (201):**
```json
{
  "userId": 12345,
  "email": "user@example.com",
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 900
}
```

#### POST /auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "userId": 12345,
  "email": "user@example.com",
  "display_name": "John Doe",
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 900
}
```

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### Party Endpoints

#### POST /party
Create a new party.

**Request:**
```json
{
  "name": "Weekend Ride",
  "settings": {
    "alertsEnabled": true,
    "privacyMode": "public"
  }
}
```

**Response (201):**
```json
{
  "partyId": 12345,
  "leaderId": 100,
  "name": "Weekend Ride",
  "inviteCode": "ABC123",
  "createdAt": "2025-11-04T15:00:00Z",
  "wsUrl": "wss://realtime.speedlink.app"
}
```

#### GET /party/{partyId}
Get party details.

**Response (200):**
```json
{
  "partyId": 12345,
  "leaderId": 100,
  "name": "Weekend Ride",
  "inviteCode": "ABC123",
  "memberCount": 5,
  "createdAt": "2025-11-04T15:00:00Z",
  "isActive": true
}
```

#### POST /party/join
Join a party by invite code.

**Request:**
```json
{
  "inviteCode": "ABC123"
}
```

**Response (200):**
```json
{
  "partyId": 12345,
  "name": "Weekend Ride",
  "leaderId": 100,
  "members": [
    {
      "userId": 100,
      "displayName": "Leader",
      "joinedAt": "2025-11-04T15:00:00Z"
    }
  ],
  "wsUrl": "wss://realtime.speedlink.app"
}
```

#### DELETE /party/{partyId}/leave
Leave a party.

**Response (204):** No content

### Report Endpoints

#### POST /report
Submit a community report.

**Request:**
```json
{
  "type": "hazard",
  "location": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "description": "Large pothole in right lane",
  "partyId": 12345 (optional)
}
```

**Response (201):**
```json
{
  "reportId": 67890,
  "type": "hazard",
  "location": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "createdAt": "2025-11-04T15:30:00Z",
  "expiresAt": "2025-11-04T17:30:00Z"
}
```

#### GET /reports/nearby
Get nearby reports.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Radius in meters (default: 5000, max: 20000)

**Response (200):**
```json
{
  "reports": [
    {
      "reportId": 67890,
      "type": "hazard",
      "location": {"lat": 34.0522, "lng": -118.2437},
      "distance": 1234,
      "upvotes": 5,
      "createdAt": "2025-11-04T15:30:00Z"
    }
  ]
}
```

### Alert Endpoints

#### GET /alerts/nearby
Get nearby alerts (speed cameras, police, etc.).

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Radius in meters (default: 2000, max: 10000)

**Response (200):**
```json
{
  "alerts": [
    {
      "alertId": 11111,
      "type": "speed_camera_fixed",
      "location": {"lat": 34.0522, "lng": -118.2437},
      "distance": 500,
      "severity": "high",
      "description": "Speed camera - 65 mph limit"
    }
  ]
}
```

---

## WebSocket Events

**Connection URL:** `wss://realtime.speedlink.app`  
**Protocol:** Socket.IO 4.x  
**Authentication:** Pass JWT as query parameter on connect

### Connection

```javascript
const socket = io('wss://realtime.speedlink.app', {
  query: { token: 'JWT_TOKEN_HERE' }
});
```

### Client → Server Events

#### `party:join`
Join a party's real-time channel.

**Payload:**
```json
{
  "partyId": 12345
}
```

**Response:** `party:joined` event

#### `party:leave`
Leave a party's real-time channel.

**Payload:**
```json
{
  "partyId": 12345
}
```

**Response:** `party:left` event

#### `location:update`
Send location update.

**Payload:**
```json
{
  "partyId": 12345,
  "location": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "speed": 25.5,
  "heading": 90,
  "timestamp": "2025-11-04T15:30:00Z"
}
```

**Note:** Throttled to max 1 update/second per user.

#### `message:send`
Send chat message to party.

**Payload:**
```json
{
  "partyId": 12345,
  "message": "Traffic ahead on I-10"
}
```

### Server → Client Events

#### `party:joined`
Confirmation of successful party join.

**Payload:**
```json
{
  "partyId": 12345,
  "members": [
    {
      "userId": 100,
      "displayName": "John",
      "location": {"lat": 34.0522, "lng": -118.2437},
      "speed": 25.5,
      "heading": 90,
      "status": "active"
    }
  ]
}
```

#### `party:member:joined`
New member joined party.

**Payload:**
```json
{
  "partyId": 12345,
  "userId": 101,
  "displayName": "Jane",
  "joinedAt": "2025-11-04T15:35:00Z"
}
```

#### `party:member:left`
Member left party.

**Payload:**
```json
{
  "partyId": 12345,
  "userId": 101,
  "leftAt": "2025-11-04T16:00:00Z"
}
```

#### `party:location:update`
Location update from a party member.

**Payload:**
```json
{
  "partyId": 12345,
  "userId": 100,
  "location": {"lat": 34.0522, "lng": -118.2437},
  "speed": 25.5,
  "heading": 90,
  "timestamp": "2025-11-04T15:30:00Z"
}
```

#### `alert:new`
New alert nearby (speed camera, hazard, etc.).

**Payload:**
```json
{
  "alertId": 11111,
  "type": "speed_camera_fixed",
  "location": {"lat": 34.0522, "lng": -118.2437},
  "distance": 500,
  "severity": "high",
  "description": "Speed camera - 65 mph limit"
}
```

#### `message:received`
Chat message from party member.

**Payload:**
```json
{
  "partyId": 12345,
  "userId": 100,
  "displayName": "John",
  "message": "Traffic ahead on I-10",
  "timestamp": "2025-11-04T15:30:00Z"
}
```

#### `error`
Error event (authentication failure, rate limit, etc.).

**Payload:**
```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many location updates. Please slow down.",
  "retryAfter": 5
}
```

---

## Error Responses

All API errors follow consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} (optional)
  }
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | INVALID_REQUEST | Malformed request body |
| 401 | UNAUTHORIZED | Missing or invalid JWT |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate email) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

_API contracts specification prepared for SpeedLink MVP development_