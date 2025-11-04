# Story 2.1: Create Wireframes

**Status:** drafted

## Story

As a **UX designer**,
I want to **create low-fidelity wireframes for all SpeedLink MVP screens and user flows**,
so that **the team has a visual blueprint for UI implementation that aligns with technical architecture and user requirements**.

## Acceptance Criteria

1. Wireframes are created for all core MVP screens: registration/login, party creation, party join, map view with party members, speed camera alerts, and basic user profile
2. User flow diagrams show navigation paths between screens for critical journeys (onboarding, creating party, joining party, receiving alerts)
3. Wireframes specify component layouts that support PWA requirements (mobile-first, installable, offline indicators)
4. Map interface wireframe shows real-time location markers, party member list, alert overlays, and distance/speed indicators aligned with ≤800ms latency display requirements
5. Alert UI patterns are designed for proximity-based notifications (2km, 1km, 500m thresholds) with visual and contextual indicators
6. Navigation and interaction patterns are documented (tap targets, swipe gestures, bottom navigation, modals) following mobile UX best practices
7. Wireframes are delivered in a shareable format (Figma, PNG exports, or equivalent) accessible to development team

## Dev Notes

**Context:** This story bridges planning (Epic 1) and implementation (Epic 2+). Wireframes inform scaffold stories (2.3 PWA, 2.4 Backend).

**Key Requirements from Previous Stories:**
- **Architecture (Story 1.3)**: PWA frontend, real-time WebSocket communication, ≤800ms latency for party updates
- **Tech Stack (Story 1.2)**: React + Vite, Mapbox GL JS for mapping, mobile-first responsive design
- **Features (Story 1.1)**: Party mode, real-time map, speed camera alerts, basic user profiles

**MVP Screens to Wireframe:**
1. **Onboarding/Authentication**: Registration, login, basic profile setup
2. **Party Management**: Create party (generate 6-digit code), join party (enter code), party member list
3. **Map View**: Real-time map with party members, location markers, speed/direction indicators, alert overlays
4. **Alerts Interface**: Speed camera proximity alerts (2km, 1km, 500m), visual/audio indicators
5. **User Profile**: Basic profile view, privacy toggle (visible/hidden in party), logout

**Design Constraints:**
- **Mobile-First**: Primary target is smartphone users (motorcycle riders, drivers)
- **PWA Requirements**: Install prompt UI, offline indicators, service worker status
- **Real-Time Feedback**: Loading states for WebSocket connection, latency indicators if >800ms
- **Accessibility**: Minimum tap target 44x44px, high contrast for outdoor visibility, large fonts for in-motion viewing

**Technical Alignment:**
- Map component must accommodate Mapbox GL JS integration
- WebSocket connection status indicator needed for real-time features
- Party code input: 6-digit numeric format
- Alert UI must support distance-based gradations (far → medium → near)

### Learnings from Previous Story

**From Story 1-3-design-system-architecture (Status: review)**

- **New Documentation Created**: 
  - SpeedLink-component-flows.md - Critical interaction flows with latency checkpoints
  - SpeedLink-api-contracts.md - REST and WebSocket API specifications
  - SpeedLink-deployment.md - AWS infrastructure topology
  - SpeedLink-security.md - Authentication and encryption architecture

- **Architecture Highlights**:
  - Real-time location updates: 150-250ms typical, <800ms guaranteed (99th percentile)
  - JWT authentication flow defined (login → token → WebSocket auth)
  - Redis pub/sub for cross-instance party state synchronization
  - Multi-AZ deployment with automatic failover

- **UI-Relevant Technical Details**:
  - WebSocket connection lifecycle: connect → authenticate → subscribe to party → receive updates
  - Party member locations updated every 3-5 seconds (configurable)
  - Alert broadcasting uses pub/sub pattern for instant delivery to all party members
  - Offline mode: service worker caches static assets, location queue for reconnection

- **Design Implications**:
  - Need connection status indicator (connected/reconnecting/offline)
  - Party member markers should show "last seen" timestamp if stale (>10s)
  - Alert UI must handle concurrent alerts (multiple cameras in range)
  - Authentication screens should communicate JWT token lifecycle (session expiry)

[Source: stories/1-3-design-system-architecture.md#Dev-Agent-Record]

### References

- [SpeedLink Feature Specifications](docs/SpeedLink-feature-specifications.md) - Detailed acceptance criteria for MVP features
- [SpeedLink Architecture](docs/SpeedLink-architecture.md) - System components and communication protocols
- [SpeedLink Component Flows](docs/SpeedLink-component-flows.md) - Party creation, location updates, alert broadcasting flows
- [SpeedLink API Contracts](docs/SpeedLink-api-contracts.md) - REST endpoints and WebSocket events
- [SpeedLink Requirements](docs/SpeedLink-requirements.md) - Functional requirements for party mode, map, and alerts

## Tasks / Subtasks

- [ ] **Task 1: Create Onboarding & Authentication Wireframes** (AC: 1, 3)
  - [ ] Registration screen with email/password fields and vehicle type selection
  - [ ] Login screen with session status and "remember me" option
  - [ ] Basic profile setup with username, vehicle type, and privacy toggle
  - [ ] PWA install prompt UI pattern

- [ ] **Task 2: Create Party Management Wireframes** (AC: 1, 4)
  - [ ] Party creation screen with 6-digit code generation and "copy code" action
  - [ ] Party join screen with numeric keypad for code entry
  - [ ] Party member list view showing online members with status indicators
  - [ ] Leave party action and confirmation modal

- [ ] **Task 3: Create Map View Wireframe** (AC: 1, 4)
  - [ ] Main map canvas with Mapbox integration placeholder
  - [ ] Party member location markers with speed/direction indicators
  - [ ] User's own location marker (distinct styling)
  - [ ] Mini member list overlay (collapsed/expanded states)
  - [ ] Bottom navigation bar (Map, Party, Profile)
  - [ ] WebSocket connection status indicator

- [ ] **Task 4: Create Alert Interface Wireframes** (AC: 1, 5)
  - [ ] Speed camera alert overlay on map (icon + distance label)
  - [ ] Proximity-based alert styling (2km: yellow, 1km: orange, 500m: red)
  - [ ] Alert notification modal with dismiss action
  - [ ] Multiple concurrent alerts layout (stacked or scrollable list)

- [ ] **Task 5: Create User Profile Wireframe** (AC: 1, 3)
  - [ ] Profile view with username, vehicle type, and join date
  - [ ] Privacy toggle (visible/hidden in party) with explanation text
  - [ ] Logout button
  - [ ] Settings placeholder for future features

- [ ] **Task 6: Document User Flow Diagrams** (AC: 2)
  - [ ] Onboarding flow: Registration → Login → Profile Setup → Map View
  - [ ] Create party flow: Map View → Create Party → Share Code → Wait for members
  - [ ] Join party flow: Map View → Join Party → Enter Code → Party Map View
  - [ ] Alert flow: Map View → Speed Camera Detected → Alert Display → Dismiss

- [ ] **Task 7: Document Interaction Patterns** (AC: 6)
  - [ ] Tap targets (minimum 44x44px, documented with annotations)
  - [ ] Swipe gestures (expand/collapse member list, dismiss alerts)
  - [ ] Bottom navigation behavior (persistent, active state indicators)
  - [ ] Modal patterns (party actions, alerts, confirmations)
  - [ ] Form validation and error states

- [ ] **Task 8: Export and Share Wireframes** (AC: 7)
  - [ ] Export wireframes in shareable format (Figma link or PNG exports)
  - [ ] Create wireframe index document with screen names and purposes
  - [ ] Share with development team and gather initial feedback
  - [ ] Store wireframes in project repository (docs/ or design/ folder)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be populated by dev agent -->

### Debug Log References

<!-- Will be populated by dev agent -->

### Completion Notes List

<!-- Will be populated by dev agent -->

### File List

<!-- Will be populated by dev agent -->

## Change Log

- **November 4, 2025**: Story 2.1 drafted - Wireframe creation scope defined with full MVP screen coverage and architectural alignment
