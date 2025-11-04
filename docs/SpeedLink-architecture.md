# SpeedLink Technical Architecture Overview

## 1. System Components
- **PWA Frontend**: User interface, map, party management, messaging, notifications
- **Real-Time Backend**: Handles party state, location updates, messaging, alerts (WebSocket/WebRTC server)
- **REST API Backend**: User authentication, profile management, persistent data storage
- **Database**: Stores user profiles, party metadata, reports, and historical data
- **Notification Service**: Web push for alerts and party events
- **Community Moderation Tools**: Admin dashboard for report review and moderation
- **3rd-Party Integrations**: Mapping APIs (Google Maps, Mapbox, OSM), weather, and traffic data providers

## 2. Data Flow
1. User logs in via PWA frontend (auth via REST API)
2. User creates/joins party; party state managed in real-time backend
3. Location, speed, and status updates sent from client to backend (≤800ms latency)
4. Backend broadcasts updates to all party members
5. Alerts (speed camera, police, hazards) pushed to clients via real-time backend and notification service
6. Community reports submitted via frontend, stored in database, and broadcast as needed

## 3. Technology Stack (Selected)
- **Frontend**: React with Vite (PWA features: service workers, offline support)
- **Real-Time Backend**: Node.js with Socket.IO for ultra-low-latency updates
- **REST API**: Node.js with Fastify
- **Database**: PostgreSQL (relational) + Redis (real-time state/cache)
- **Notifications**: Web Push API
- **Mapping**: Mapbox GL JS (preferred for real-time, customizable maps)
- **Hosting**: Vercel for frontend (PWA), AWS/GCP/Azure for backend and databases

## 4. Security & Privacy
- All communication encrypted (HTTPS, WSS)
- User data encrypted at rest
- GDPR-compliant data handling
- Opt-in for all tracking/location features

## 5. Scalability & Reliability
- Real-time backend horizontally scalable (stateless, supports sharding/partitioning)
- Database replication and backup
- Monitoring and alerting for uptime and latency

---
_Prepared for Orion, November 2025_