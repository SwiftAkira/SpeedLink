# SpeedLink Project Brief

# SpeedLink Project Brief

## What is SpeedLink?

## Executive Summary

SpeedLink is a free, Progressive Web App (PWA) for motorcycle riders and spirited drivers who want to stay connected while on the road. Share your live location with friends, get speed camera alerts, and avoid fines—all without downloading an app from the store.SpeedLink is a mobile-first, Progressive Web App (PWA) designed for groups of motorcycle riders and spirited drivers who want to travel together, avoid fines, and stay connected. By leveraging PWA technology, SpeedLink bypasses many restrictions of traditional app stores, offering a seamless experience across devices. The app’s most critical feature is ultra-low-latency live party updates (≤800ms delay), ensuring real-time group awareness. SpeedLink provides real-time group location sharing, speed and hazard alerts, and a social experience tailored for enthusiasts—while maintaining a focus on safety and legal compliance.



## The Problem## Objectives

- Enable real-time group navigation and party mode for friends

Riders traveling in groups often get separated, miss speed cameras, and have no easy way to stay connected without expensive radio equipment or unsafe texting.- Achieve ultra-low-latency live party updates (≤800ms delay) for all group members

- Help users avoid speed cameras, police traps, and fines

## The Solution- Foster a community-driven reporting system for hazards and enforcement

- Prioritize privacy, safety, and legal compliance

SpeedLink provides:

- **Real-time location sharing** with your riding group (≤800ms latency)## Core Features

- **Speed camera alerts** to help avoid fines1. **Ultra-Low-Latency Party/Group Mode**: Create or join a private group to share live location, speed, and status on a minimap, with updates delivered in ≤800ms.

- **Party mode** with 6-digit codes for easy group joining2. **Real-Time Map**: See all party members on a live map with speed, direction, and distance.

- **Privacy controls** to manage who sees your location3. **Speed Camera & Police Alerts**: Receive instant notifications for speed cameras, police, and hazards (community and official sources).

- **PWA technology** - install directly from your browser, no app store needed4. **Community Reporting**: Users can report hazards, police, cameras, and road conditions; upvote/downvote for accuracy.

5. **Route Navigation**: Turn-by-turn navigation with party-aware ETA and route sharing.

## Core MVP Features6. **Privacy Controls**: Toggle visibility, ghost mode, and fine-grained location sharing.

7. **In-App Messaging**: Quick chat or voice for party coordination.

1. **Party/Group Mode** - Create or join groups with simple codes8. **Emergency/SOS**: One-tap alert to party or emergency contacts in case of incident.

2. **Real-Time Map** - See all group members live on Mapbox9. **Ride Profiles**: Customizable profiles for bike/car type, riding style, and preferences.

3. **Speed Camera Alerts** - Get notified when approaching cameras10. **Weather & Road Alerts**: Real-time weather and road condition notifications.

4. **User Profiles** - Basic authentication and privacy settings

## User Stories

## Future Features (Post-MVP)- As a rider, I want to see my friends on a minimap so we can stay together.

- As a group leader, I want to set a route and share it with my party.

- Community reporting of hazards and police- As a user, I want to receive alerts for speed cameras and police so I can avoid fines.

- Turn-by-turn navigation- As a community member, I want to report hazards and verify others’ reports.

- In-app messaging- As a privacy-conscious user, I want to control who can see my location and speed.

- Emergency/SOS button- As a rider, I want to send a quick SOS to my group if I have an emergency.

- Weather alerts- As a user, I want to chat or talk with my party while riding.



## Technology Stack## Technical Requirements

- **Platforms**: Progressive Web App (PWA) for universal access, installable on iOS, Android, and desktop; no reliance on app stores

- **Frontend**: Next.js 14 with TypeScript (PWA-enabled)- **Ultra-Low-Latency Backend**: Real-time backend must deliver party location and status updates to all group members in ≤800ms (WebSocket, WebRTC, or similar technology required)

- **Backend**: Supabase (free tier - PostgreSQL + real-time + auth)- **Mapping**: Integration with Google Maps, Mapbox, or OpenStreetMap

- **Mapping**: Mapbox GL JS- **Real-Time Backend**: Scalable backend for live location, messaging, and alerts

- **Hosting**: Vercel (free tier)- **Authentication**: Email, phone, or social login

- **Total Cost**: $0/month for MVP- **Notifications**: Push notifications for alerts and party events (using web push where possible)

- **Data Privacy**: GDPR-compliant, encrypted location and user data

## Target Users- **Battery Optimization**: Efficient background location updates

- **Community Moderation**: Tools for flagging false reports

- Motorcycle riders (sport bikes, cruisers, adventure)

- Spirited drivers (car enthusiasts)## Safety & Legal

- Group ride organizers- Display speed limits and gentle warnings (not encouragement)

- Privacy-conscious users who want control over their data- Disclaimers to obey local laws

- Opt-in for all tracking and sharing features

## Safety & Legal

## Future Enhancements

- Speed limit displays with gentle warnings (not encouragement to speed)- Voice command integration

- Legal disclaimers to obey local laws- Helmet comms support

- Opt-in for all tracking features- Premium features (ad-free, custom themes, advanced analytics)

- GDPR-compliant data handling

---

## Why PWA?_Prepared for Orion, November 2025_

- ✅ No app store approval needed
- ✅ Install directly from browser
- ✅ Works on iOS, Android, and desktop
- ✅ Offline functionality
- ✅ Push notifications
- ✅ Automatic updates

---

**Built for riders, by riders. 100% free. No ads. No tracking without permission.**
