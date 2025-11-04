
# SpeedLink Project Brief

## Executive Summary
SpeedLink is a mobile-first, Progressive Web App (PWA) designed for groups of motorcycle riders and spirited drivers who want to travel together, avoid fines, and stay connected. By leveraging PWA technology, SpeedLink bypasses many restrictions of traditional app stores, offering a seamless experience across devices. The app’s most critical feature is ultra-low-latency live party updates (≤800ms delay), ensuring real-time group awareness. SpeedLink provides real-time group location sharing, speed and hazard alerts, and a social experience tailored for enthusiasts—while maintaining a focus on safety and legal compliance.

## Objectives
- Enable real-time group navigation and party mode for friends
- Achieve ultra-low-latency live party updates (≤800ms delay) for all group members
- Help users avoid speed cameras, police traps, and fines
- Foster a community-driven reporting system for hazards and enforcement
- Prioritize privacy, safety, and legal compliance

## Core Features
1. **Ultra-Low-Latency Party/Group Mode**: Create or join a private group to share live location, speed, and status on a minimap, with updates delivered in ≤800ms.
2. **Real-Time Map**: See all party members on a live map with speed, direction, and distance.
3. **Speed Camera & Police Alerts**: Receive instant notifications for speed cameras, police, and hazards (community and official sources).
4. **Community Reporting**: Users can report hazards, police, cameras, and road conditions; upvote/downvote for accuracy.
5. **Route Navigation**: Turn-by-turn navigation with party-aware ETA and route sharing.
6. **Privacy Controls**: Toggle visibility, ghost mode, and fine-grained location sharing.
7. **In-App Messaging**: Quick chat or voice for party coordination.
8. **Emergency/SOS**: One-tap alert to party or emergency contacts in case of incident.
9. **Ride Profiles**: Customizable profiles for bike/car type, riding style, and preferences.
10. **Weather & Road Alerts**: Real-time weather and road condition notifications.

## User Stories
- As a rider, I want to see my friends on a minimap so we can stay together.
- As a group leader, I want to set a route and share it with my party.
- As a user, I want to receive alerts for speed cameras and police so I can avoid fines.
- As a community member, I want to report hazards and verify others’ reports.
- As a privacy-conscious user, I want to control who can see my location and speed.
- As a rider, I want to send a quick SOS to my group if I have an emergency.
- As a user, I want to chat or talk with my party while riding.

## Technical Requirements
- **Platforms**: Progressive Web App (PWA) for universal access, installable on iOS, Android, and desktop; no reliance on app stores
- **Ultra-Low-Latency Backend**: Real-time backend must deliver party location and status updates to all group members in ≤800ms (WebSocket, WebRTC, or similar technology required)
- **Mapping**: Integration with Google Maps, Mapbox, or OpenStreetMap
- **Real-Time Backend**: Scalable backend for live location, messaging, and alerts
- **Authentication**: Email, phone, or social login
- **Notifications**: Push notifications for alerts and party events (using web push where possible)
- **Data Privacy**: GDPR-compliant, encrypted location and user data
- **Battery Optimization**: Efficient background location updates
- **Community Moderation**: Tools for flagging false reports

## Safety & Legal
- Display speed limits and gentle warnings (not encouragement)
- Disclaimers to obey local laws
- Opt-in for all tracking and sharing features

## Future Enhancements
- Voice command integration
- Helmet comms support
- Premium features (ad-free, custom themes, advanced analytics)

---
_Prepared for Orion, November 2025_