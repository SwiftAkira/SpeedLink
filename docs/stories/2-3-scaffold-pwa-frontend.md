# Story 2.3: Scaffold PWA Frontend

**Status:** drafted

## Story

As a **frontend developer**,
I want to **scaffold the SpeedLink PWA frontend using React + Vite with initial project structure, PWA configuration, and development environment setup**,
so that **development of UI components and real-time features can begin with proper PWA capabilities, offline support, and mobile-first responsive design**.

## Acceptance Criteria

1. React + Vite project is scaffolded with TypeScript configuration and ES6 module support
2. PWA manifest and service worker are configured with offline support using `vite-plugin-pwa` and Workbox
3. Project structure follows architectural specifications: components/, pages/, services/, utils/, with clear separation of concerns
4. Development environment is configured with ESLint, Prettier, and hot module replacement (HMR) working correctly
5. Mapbox GL JS is integrated with API key management and basic map component placeholder
6. Routing is configured using React Router with lazy-loaded routes for performance optimization
7. Build and deployment scripts are verified to produce optimized PWA bundles with service worker registration

## Dev Notes

**Context:** This story creates the frontend foundation before feature implementation (Epic 3+). Must align with wireframes (Story 2.1), repository structure (Story 2.2), and technical architecture (Story 1.3).

**Key Requirements from Previous Stories:**
- **Architecture (Story 1.3)**: PWA frontend with offline support, WebSocket client for real-time updates, Mapbox GL JS for mapping, deployed to Vercel
- **Tech Stack (Story 1.2)**: React 18 + Vite, PWA with service worker, mobile-first responsive design
- **Wireframes (Story 2.1)**: 5 core screens (onboarding, party, map, alerts, profile), bottom navigation, modal patterns
- **Repository (Story 2.2)**: GitHub repository with CI/CD pipelines, .env.template with VITE_API_URL, VITE_WS_URL, VITE_MAPBOX_TOKEN

**Project Structure to Scaffold:**

```
speedlink-frontend/
├── public/
│   ├── manifest.json (PWA manifest)
│   ├── favicon.ico
│   ├── icons/ (PWA icons 192x192, 512x512)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── common/ (Button, Input, Modal, etc.)
│   │   ├── layout/ (Header, Footer, BottomNav)
│   │   ├── map/ (MapView, PartyMarker, AlertOverlay)
│   │   └── party/ (PartyList, PartyCard, JoinForm)
│   ├── pages/
│   │   ├── Auth/ (Login, Register)
│   │   ├── Map/ (main map view)
│   │   ├── Party/ (create, join, manage)
│   │   ├── Profile/ (user profile)
│   │   └── NotFound/ (404)
│   ├── services/
│   │   ├── api.ts (REST API client with axios/fetch)
│   │   ├── websocket.ts (Socket.IO client wrapper)
│   │   └── geolocation.ts (browser geolocation API wrapper)
│   ├── hooks/
│   │   ├── useAuth.ts (authentication state)
│   │   ├── useWebSocket.ts (WebSocket connection management)
│   │   └── useGeolocation.ts (user location tracking)
│   ├── utils/
│   │   ├── constants.ts (app constants)
│   │   ├── validators.ts (form validation)
│   │   └── storage.ts (localStorage wrapper)
│   ├── styles/
│   │   └── index.css (global styles, CSS variables)
│   ├── App.tsx (router setup, global providers)
│   ├── main.tsx (React render + service worker registration)
│   └── vite-env.d.ts (TypeScript declarations)
├── .env.template
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── vite.config.ts (with PWA plugin configuration)
├── package.json
└── README.md
```

**PWA Configuration Requirements:**

**manifest.json:**
- App name: "SpeedLink"
- Short name: "SpeedLink"
- Description: "Real-time group navigation and speed camera alerts"
- Theme color: #primary-color (to be defined)
- Background color: #ffffff
- Display: "standalone" (fullscreen mobile app experience)
- Start URL: "/"
- Icons: 192x192 and 512x512 PNG (placeholder or simple logo)

**Service Worker (vite-plugin-pwa):**
- Cache strategy: NetworkFirst for API calls, CacheFirst for assets
- Offline fallback page
- Background sync for location updates when reconnecting
- Push notification support (skeleton for future implementation)
- Auto-update prompt when new version available

**Vite Configuration:**
- PWA plugin with Workbox
- Environment variable loading (.env files)
- Build optimization (code splitting, tree shaking)
- Dev server HTTPS (for geolocation API testing)
- Proxy configuration for local backend testing

**Development Environment:**
- ESLint: React hooks rules, TypeScript rules, accessibility checks (jsx-a11y)
- Prettier: 2-space indent, single quotes, trailing commas
- Hot Module Replacement: Fast refresh for React components
- TypeScript: Strict mode enabled

**External Dependencies to Install:**
- **Core**: `react`, `react-dom`, `react-router-dom`
- **PWA**: `vite-plugin-pwa`, `workbox-window`
- **Map**: `mapbox-gl`, `@types/mapbox-gl`
- **Real-Time**: `socket.io-client`
- **HTTP Client**: `axios` (or use native `fetch`)
- **Dev Tools**: `eslint`, `prettier`, `typescript`, `@vitejs/plugin-react`

### Learnings from Previous Story

**From Story 2-2-set-up-repositories (Status: drafted)**

- **Repository Created**: `speedlink-frontend` GitHub repository initialized with directory structure
- **CI/CD Pipelines**: GitHub Actions configured for linting, testing, and Vercel deployment
- **Branch Strategy**: `main` (protected), `dev` (integration), `feature/*` branches
- **Environment Variables**: `.env.template` created with VITE_API_URL, VITE_WS_URL, VITE_MAPBOX_TOKEN
- **Collaboration Tools**: Issue templates, PR templates, CODEOWNERS file configured

- **Scaffolding Implications**:
  - Clone repository and scaffold directly into it (not a fresh `npm create vite`)
  - Respect existing .gitignore and directory structure
  - Ensure CI/CD pipelines pass after scaffolding (linting, build verification)
  - Follow repository structure documented in Story 2.2 (public/, src/components/, etc.)
  - Commit scaffold with meaningful message: "chore: scaffold React + Vite PWA frontend with TypeScript and PWA plugin"

[Source: stories/2-2-set-up-repositories.md#Dev-Agent-Record]

### References

- [SpeedLink Architecture](docs/SpeedLink-architecture.md) - PWA frontend component specifications
- [SpeedLink Tech Stack](docs/SpeedLink-tech-stack.md) - React + Vite selection rationale and PWA capabilities
- [SpeedLink Wireframes](docs/stories/2-1-create-wireframes.md) - UI component structure and screen breakdown
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/) - Service worker configuration and Workbox integration
- [React Router Docs](https://reactrouter.com/) - Routing setup and lazy loading

## Tasks / Subtasks

- [ ] **Task 1: Initialize React + Vite Project with TypeScript** (AC: 1, 4)
  - [ ] Run `npm create vite@latest` (or scaffold directly if repo exists) with React + TypeScript template
  - [ ] Install dependencies: `npm install`
  - [ ] Configure `tsconfig.json` with strict mode and path aliases (`@/` for src/)
  - [ ] Configure ESLint with React, TypeScript, and accessibility rules
  - [ ] Configure Prettier with project code style
  - [ ] Verify HMR works: start dev server, edit component, see live reload

- [ ] **Task 2: Configure PWA Plugin and Service Worker** (AC: 2, 7)
  - [ ] Install `vite-plugin-pwa` and `workbox-window`
  - [ ] Configure `vite.config.ts` with PWA plugin options (manifest, workbox strategies)
  - [ ] Create `public/manifest.json` with app metadata and icon references
  - [ ] Add PWA icons to `public/icons/` (192x192, 512x512 placeholders)
  - [ ] Register service worker in `src/main.tsx` with update prompt
  - [ ] Test offline mode: build, serve, disconnect network, verify app loads

- [ ] **Task 3: Scaffold Project Directory Structure** (AC: 3)
  - [ ] Create `src/components/` with subdirectories (common/, layout/, map/, party/)
  - [ ] Create `src/pages/` with route directories (Auth/, Map/, Party/, Profile/)
  - [ ] Create `src/services/` (api.ts, websocket.ts, geolocation.ts)
  - [ ] Create `src/hooks/` (useAuth.ts, useWebSocket.ts, useGeolocation.ts)
  - [ ] Create `src/utils/` (constants.ts, validators.ts, storage.ts)
  - [ ] Create `src/styles/index.css` with CSS variables for theme
  - [ ] Add placeholder components with "TODO: Implement X" comments

- [ ] **Task 4: Configure React Router** (AC: 6)
  - [ ] Install `react-router-dom`
  - [ ] Set up `App.tsx` with `BrowserRouter` and route definitions
  - [ ] Implement lazy loading for route components (`React.lazy()`)
  - [ ] Create placeholder pages for all routes (Auth, Map, Party, Profile, 404)
  - [ ] Add bottom navigation component with route links
  - [ ] Test navigation between routes

- [ ] **Task 5: Integrate Mapbox GL JS** (AC: 5)
  - [ ] Install `mapbox-gl` and `@types/mapbox-gl`
  - [ ] Create `MapView` component in `src/components/map/`
  - [ ] Configure Mapbox access token from `VITE_MAPBOX_TOKEN` environment variable
  - [ ] Add basic map initialization with default center and zoom
  - [ ] Import Mapbox CSS in global styles
  - [ ] Test map renders correctly on Map page

- [ ] **Task 6: Set Up API and WebSocket Services** (AC: 3)
  - [ ] Create `src/services/api.ts` with axios/fetch HTTP client and base URL configuration
  - [ ] Create `src/services/websocket.ts` with Socket.IO client wrapper and connection lifecycle methods
  - [ ] Create `src/services/geolocation.ts` with browser Geolocation API wrapper
  - [ ] Add error handling and retry logic for network requests
  - [ ] Document service APIs with JSDoc comments

- [ ] **Task 7: Configure Environment Variables** (AC: 4)
  - [ ] Create `.env.template` with VITE_API_URL, VITE_WS_URL, VITE_MAPBOX_TOKEN
  - [ ] Create `.env.development` with local development values (e.g., localhost:3000)
  - [ ] Document environment variable usage in README
  - [ ] Verify environment variables load correctly in dev mode

- [ ] **Task 8: Verify Build and Deployment** (AC: 7)
  - [ ] Run `npm run build` and verify dist/ folder created
  - [ ] Check service worker is registered in production build
  - [ ] Verify PWA manifest is included in build output
  - [ ] Test production build locally with `npm run preview`
  - [ ] Push to GitHub and verify CI/CD pipeline passes
  - [ ] Verify Vercel deployment succeeds and PWA is installable

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

- **November 4, 2025**: Story 2.3 drafted - PWA frontend scaffold scope defined with React + Vite, service worker configuration, and project structure
