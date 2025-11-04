# SpeedLink

**Real-time group navigation app for motorcycle riders and spirited drivers**

## Overview

SpeedLink is a Progressive Web App (PWA) that enables groups of riders to stay connected through real-time location sharing, speed camera alerts, and community reporting. The app prioritizes ultra-low-latency updates (≤800ms) to keep groups synchronized on the road.

## Core Features

### MVP Features (Week 1)
1. **Party/Group Mode** - Create or join private groups with unique codes for real-time coordination
2. **Real-Time Map** - Live map showing all party members with speed, direction, and location updates
3. **Speed Camera Alerts** - Instant notifications for speed cameras and hazards based on proximity
4. **Basic User Profiles** - Simple authentication and profile management with privacy controls

### Future Features
- **Community Reporting** - Report and verify hazards, police, road conditions
- **Route Navigation** - Turn-by-turn navigation with party-aware ETA
- **In-App Messaging** - Text chat for party coordination
- **Emergency/SOS** - One-tap alert to party or emergency contacts
- **Weather & Road Alerts** - Real-time weather and road condition notifications
- **Advanced Privacy Controls** - Fine-grained data sharing controls

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with built-in PWA capabilities
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling
- **Mapbox GL JS** - Interactive mapping with real-time updates
- **PWA Support** - Offline functionality, installable, push notifications

### Backend
- **Supabase** (Free Tier) - Complete backend solution
  - **Authentication** - Email/password, social logins
  - **PostgreSQL Database** - User profiles, parties, reports, alerts
  - **Realtime** - WebSocket-based subscriptions for live updates
  - **Storage** - User avatars and media
  - **Edge Functions** - Serverless functions when needed

### Why This Stack?

**Next.js Benefits:**
- Built-in PWA support with `next-pwa`
- Server-side rendering for better performance
- API routes for custom backend logic
- Automatic code splitting and optimization
- Great developer experience with hot reloading
- Easy deployment (Vercel free tier)

**Supabase Benefits:**
- 100% free for MVP (500MB database, 2GB bandwidth, 50GB file storage)
- Instant setup - no infrastructure management
- Real-time subscriptions built-in (perfect for ≤800ms requirement)
- Row Level Security (RLS) for privacy controls
- Automatic REST API generation
- Built-in authentication with multiple providers

## Key Requirements

### Performance
- **Ultra-low latency**: Party location updates delivered in ≤800ms
- **Scalability**: Support 1000+ concurrent parties
- **Battery efficiency**: Optimized background location updates

### Privacy & Security
- GDPR-compliant data handling
- Encrypted data in transit and at rest
- Opt-in for all tracking and sharing
- Fine-grained privacy controls

### Safety & Legal
- Display speed limits with gentle warnings
- Legal disclaimers to obey local laws
- Community moderation tools

## User Stories

- **As a rider**, I want to see my friends on a minimap so we can stay together
- **As a group leader**, I want to set a route and share it with my party
- **As a user**, I want to receive alerts for speed cameras and police so I can avoid fines
- **As a community member**, I want to report hazards and verify others' reports
- **As a privacy-conscious user**, I want to control who can see my location and speed
- **As a rider**, I want to send a quick SOS to my group if I have an emergency

## Database Schema (Simplified)

```sql
-- Users
users (
  id uuid primary key,
  email text unique,
  username text,
  vehicle_type text,
  is_visible boolean default true,
  created_at timestamp
)

-- Parties
parties (
  id uuid primary key,
  code text unique, -- 6-digit join code
  name text,
  leader_id uuid references users(id),
  is_active boolean default true,
  created_at timestamp
)

-- Party Members
party_members (
  party_id uuid references parties(id),
  user_id uuid references users(id),
  joined_at timestamp,
  primary key (party_id, user_id)
)

-- User Locations (Real-time via Supabase Realtime)
user_locations (
  user_id uuid references users(id) primary key,
  latitude decimal,
  longitude decimal,
  speed decimal,
  heading decimal,
  updated_at timestamp
)

-- Speed Cameras
speed_cameras (
  id uuid primary key,
  latitude decimal,
  longitude decimal,
  type text, -- fixed, mobile, red_light
  speed_limit int,
  verified boolean default false
)

-- Community Reports
reports (
  id uuid primary key,
  user_id uuid references users(id),
  type text, -- police, hazard, accident, camera
  latitude decimal,
  longitude decimal,
  description text,
  upvotes int default 0,
  downvotes int default 0,
  created_at timestamp,
  expires_at timestamp
)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)
- Mapbox API key (free tier)

### Setup Steps

1. **Clone and install dependencies**
```bash
cd SpeedLink
npm install
```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy the project URL and anon key
   - Run the database schema (see database.sql)

3. **Configure environment variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended - Free)
- Connect GitHub repository to Vercel
- Add environment variables
- Deploy automatically on push to main

### PWA Installation
- Users can install directly from browser (Chrome, Safari, Edge)
- No app store submission required
- Works on iOS, Android, and desktop

## Development Roadmap

### Week 1 (MVP)
- [x] Day 1: Planning & Architecture ✅
- [ ] Day 2: Setup Next.js, Supabase, basic UI
- [ ] Day 3: Authentication & party creation
- [ ] Day 4: Real-time map & location sharing
- [ ] Day 5: Speed camera alerts & basic reporting
- [ ] Day 6: Testing, bug fixes, PWA setup
- [ ] Day 7: Deploy MVP, documentation

### Post-MVP (Weeks 2-4)
- Community reporting with voting
- Route navigation integration
- In-app messaging
- Advanced privacy controls
- Emergency/SOS features

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the riding community**
