# SpeedLink Requirements Specification

## 1. Introduction
This document details the functional and non-functional requirements for SpeedLink, a PWA for real-time group navigation and speed/hazard alerts.

## 2. User Roles
- **Rider/Driver**: Core user, joins or creates parties, shares/receives location and alerts
- **Party Leader**: Organizes group rides, sets routes, manages party
- **Guest**: Limited access, can view public parties or join via invite
- **Admin/Moderator**: (Future) Manages community reports, flags abuse

## 3. Functional Requirements

### 3.1 Party/Group Mode
- Users can create, join, or leave a party
- Each party has a unique code or invite link
- Party members’ locations, speed, and status are shared in real time (≤800ms delay)
- Party leader can set a shared route
- Party chat (text/voice) for coordination

### 3.2 Real-Time Map
- Display all party members on a minimap with live updates
- Show speed, direction, and distance for each member
- Map auto-centers on party or user

### 3.3 Speed Camera & Police Alerts
- Receive instant alerts for speed cameras, police, and hazards
- Alerts are sourced from community reports and official data
- Alert display is context-aware (distance, direction, party relevance)

### 3.4 Community Reporting
- Users can report hazards, police, cameras, and road conditions
- Reports can be upvoted/downvoted for accuracy
- Moderation tools for false/abusive reports

### 3.5 Route Navigation
- Turn-by-turn navigation with party-aware ETA
- Party leader can broadcast route changes

### 3.6 Privacy Controls
- Users can toggle visibility (on/off/ghost mode)
- Fine-grained control over what data is shared

### 3.7 In-App Messaging
- Text and (optionally) voice chat for party members
- Quick reactions and alerts

### 3.8 Emergency/SOS
- One-tap SOS sends location and alert to party or emergency contacts

### 3.9 Ride Profiles
- Users can set bike/car type, riding style, and preferences

### 3.10 Weather & Road Alerts
- Real-time weather and road condition notifications

## 4. Non-Functional Requirements
- **Performance**: Party updates must be delivered in ≤800ms
- **Reliability**: 99.9% uptime for real-time backend
- **Security**: All data encrypted in transit and at rest
- **Privacy**: GDPR-compliant, opt-in for all tracking
- **Scalability**: Support for 1000+ concurrent parties
- **Cross-Platform**: PWA installable on iOS, Android, desktop
- **Battery Efficiency**: Minimize background location drain

## 5. Technical Constraints
- Use WebSocket, WebRTC, or similar for ultra-low-latency updates
- Use mapping APIs with real-time update support
- Web push for notifications (where supported)
- Backend must be horizontally scalable

## 6. Open Questions
- What authentication methods are preferred (email, phone, social)?
- Should voice chat be MVP or future enhancement?
- What level of moderation is required at launch?

---
_Prepared for Orion, November 2025_