# SpeedLink Backend Planning

## 1. Overview
The backend for SpeedLink will consist of two main services:
- **Real-Time Service** (Node.js + Socket.IO): Handles party state, location/speed updates, messaging, and real-time alerts with ≤800ms latency.
- **REST API Service** (Node.js + Fastify): Handles authentication, user/profile management, persistent party data, and community reports.

Both services will use PostgreSQL for persistent storage and Redis for real-time state and pub/sub.

## 2. Main Services & Responsibilities
- **Real-Time Service**
  - Party creation/join/leave
  - Real-time location, speed, and status updates
  - Broadcasts party state to all members
  - Real-time messaging (text, future: voice)
  - Pushes alerts (speed camera, police, hazards)
  - Manages party presence and disconnections
  - Uses Redis for fast state sync and pub/sub
- **REST API Service**
  - User registration/login (JWT auth)
  - Profile management (vehicle, preferences)
  - Party metadata (history, saved routes)
  - Community report submission and moderation
  - Fetching map overlays, weather, and traffic data

## 3. Key Endpoints (REST API)
- `POST /auth/register` – Register new user
- `POST /auth/login` – Login and receive JWT
- `GET /profile` – Get user profile
- `PUT /profile` – Update user profile
- `POST /party` – Create party
- `GET /party/:id` – Get party info
- `POST /party/:id/join` – Join party
- `POST /party/:id/leave` – Leave party
- `GET /party/:id/history` – Get party ride history
- `POST /report` – Submit community report
- `GET /alerts` – Fetch current alerts (cameras, police, hazards)

## 4. Real-Time Events (Socket.IO)
- `connect` / `disconnect`
- `party:create` / `party:join` / `party:leave`
- `party:update` (location, speed, status)
- `party:message` (chat)
- `party:alert` (push alert to party)
- `party:presence` (who is online)

## 5. Data Models (Simplified)
- **User**: id, email, password_hash, display_name, vehicle_type, preferences, created_at
- **Party**: id, leader_id, name, invite_code, created_at, is_active
- **PartyMember**: id, party_id, user_id, joined_at, last_location, last_speed, status
- **Report**: id, user_id, type, location, description, upvotes, downvotes, created_at
- **Alert**: id, type, location, description, source, created_at, expires_at

## 6. Real-Time Architecture
- Socket.IO server cluster (stateless, horizontally scalable)
- Redis for pub/sub and fast state sharing between nodes
- PostgreSQL for persistent data
- JWT for authentication (token passed on socket connect)

## 7. Security & Rate Limiting
- JWT auth for all endpoints and socket connections
- Rate limiting on report submissions and party creation
- Input validation and sanitization
- Audit logging for moderation

---
_Prepared for Orion, November 2025_