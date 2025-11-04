# Story 2.2: Set Up Repositories

**Status:** drafted

## Story

As a **DevOps engineer**,
I want to **set up GitHub repositories with proper branching strategy, CI/CD pipelines, and deployment configurations for SpeedLink frontend and backend**,
so that **the development team can collaborate effectively with automated testing, linting, and deployment workflows**.

## Acceptance Criteria

1. GitHub repositories are created and configured: speedlink-frontend (React/Vite PWA) and speedlink-backend (Node.js REST + Real-Time services)
2. Repository structure follows best practices with README, .gitignore, LICENSE, and initial directory scaffolding aligned with architecture specifications
3. Branching strategy is documented and configured (main, dev, feature branches) with branch protection rules for main
4. CI/CD pipelines are configured using GitHub Actions for both repositories: linting, testing, and build verification on pull requests
5. Deployment workflows are configured: frontend to Vercel (or equivalent CDN), backend to AWS ECS (or staging environment) with environment-specific configurations
6. Environment variables and secrets management is documented (.env templates, GitHub Secrets for CI/CD)
7. Collaboration settings are configured: issue templates, pull request templates, code owners file, and team access permissions

## Dev Notes

**Context:** This story establishes the development infrastructure before scaffolding stories (2.3, 2.4). Repositories must support PWA requirements, real-time backend architecture, and multi-environment deployment.

**Key Requirements from Previous Stories:**
- **Architecture (Story 1.3)**: Separate frontend (PWA) and backend (REST + Real-Time) repositories, AWS ECS deployment for backend, Vercel/CDN for frontend
- **Tech Stack (Story 1.2)**: Frontend: React + Vite, Backend: Node.js + Fastify + Socket.IO, PostgreSQL + Redis databases
- **Wireframes (Story 2.1)**: Mobile-first PWA screens, installable, offline-capable

**Repository Structure Requirements:**

**Frontend Repository (speedlink-frontend):**
`
speedlink-frontend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml (lint, test, build)
│   │   └── deploy.yml (Vercel deployment)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── public/
│   ├── manifest.json (PWA manifest)
│   └── service-worker.js (offline support)
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/ (API clients)
│   ├── utils/
│   └── App.jsx
├── .env.template
├── .gitignore
├── .eslintrc.json
├── vite.config.js
├── package.json
├── README.md
└── LICENSE
`

**Backend Repository (speedlink-backend):**
`
speedlink-backend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml (lint, test, build)
│   │   └── deploy.yml (AWS ECS deployment)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── api/ (Fastify REST controllers)
│   ├── realtime/ (Socket.IO event handlers)
│   ├── services/ (business logic)
│   ├── models/ (database models)
│   ├── middleware/
│   ├── utils/
│   ├── api-server.js (Fastify entry)
│   └── realtime-server.js (Socket.IO entry)
├── tests/
│   ├── unit/
│   └── integration/
├── .env.template
├── .gitignore
├── .eslintrc.json
├── Dockerfile (for ECS deployment)
├── docker-compose.yml (local dev with PostgreSQL + Redis)
├── package.json
├── README.md
└── LICENSE
`

**Branching Strategy:**
- **main**: Production-ready code, protected branch, requires PR + approvals
- **dev**: Integration branch for feature testing
- **feature/\***: Individual feature branches (e.g., eature/party-system, eature/auth)
- **hotfix/\***: Urgent production fixes

**CI/CD Pipeline Requirements:**

**Frontend CI/CD:**
1. **Linting**: ESLint + Prettier checks
2. **Testing**: Vitest unit tests, React Testing Library component tests
3. **Build**: Vite production build, PWA manifest validation
4. **Deployment**: Automatic deployment to Vercel on merge to main, preview deployments for PRs

**Backend CI/CD:**
1. **Linting**: ESLint checks
2. **Testing**: Jest unit tests, Supertest integration tests (mocked DB)
3. **Build**: Docker image build, Node.js build verification
4. **Deployment**: Push Docker image to ECR, deploy to ECS staging on merge to dev, production on merge to main

**Environment Variables:**
- **Frontend**: VITE_API_URL, VITE_WS_URL, VITE_MAPBOX_TOKEN
- **Backend**: DATABASE_URL, REDIS_URL, JWT_SECRET, MAPBOX_API_KEY, PORT, NODE_ENV

**Security Considerations:**
- GitHub Secrets for sensitive CI/CD variables (AWS credentials, API keys)
- Branch protection: require status checks, no force push, require code review
- .env.template files with placeholder values (never commit real secrets)
- CODEOWNERS file to require architecture/lead approval for critical files

### Learnings from Previous Story

**From Story 2-1-create-wireframes (Status: drafted)**

- **Wireframes Created**: Onboarding, party management, map view, alerts, and profile screens designed
- **PWA Requirements**: Install prompt UI, offline indicators, service worker status components needed in frontend
- **Mobile-First Design**: Primary target is smartphone users, responsive design mandatory
- **Real-Time UI Components**: WebSocket connection status indicator, party member markers, alert overlays
- **Interaction Patterns**: Bottom navigation, swipe gestures, modal patterns documented

- **Repository Implications**:
  - Frontend needs service worker configuration for offline support
  - Component library structure should match wireframe screen breakdown
  - Asset pipeline for map icons, alert icons, and PWA manifest icons required
  - Mapbox GL JS integration points identified (map canvas, markers, overlays)

[Source: stories/2-1-create-wireframes.md#Dev-Agent-Record]

### References

- [SpeedLink Architecture](docs/SpeedLink-architecture.md) - System components and deployment topology
- [SpeedLink Deployment](docs/SpeedLink-deployment.md) - AWS infrastructure and CI/CD specifications
- [SpeedLink Tech Stack](docs/SpeedLink-tech-stack.md) - Frontend and backend technology selections
- [SpeedLink Security](docs/SpeedLink-security.md) - Authentication, encryption, and secret management

## Tasks / Subtasks

- [ ] **Task 1: Create Frontend Repository** (AC: 1, 2)
  - [ ] Initialize speedlink-frontend GitHub repository
  - [ ] Create initial directory structure (public/, src/, components, pages, services)
  - [ ] Add README with project description, tech stack, and setup instructions
  - [ ] Configure .gitignore (node_modules, .env, dist, build artifacts)
  - [ ] Add LICENSE file (MIT or project-appropriate license)
  - [ ] Create .env.template with frontend environment variables

- [ ] **Task 2: Create Backend Repository** (AC: 1, 2)
  - [ ] Initialize speedlink-backend GitHub repository
  - [ ] Create initial directory structure (src/api, src/realtime, src/services, src/models, tests/)
  - [ ] Add README with project description, tech stack, and setup instructions
  - [ ] Configure .gitignore (node_modules, .env, logs, coverage)
  - [ ] Add LICENSE file
  - [ ] Create .env.template with backend environment variables
  - [ ] Add Dockerfile for ECS deployment
  - [ ] Add docker-compose.yml for local development (PostgreSQL + Redis)

- [ ] **Task 3: Configure Branching Strategy** (AC: 3)
  - [ ] Document branching strategy in both READMEs (main, dev, feature/\*, hotfix/\*)
  - [ ] Create dev branch in both repositories
  - [ ] Configure branch protection rules for main: require PR, status checks, no force push
  - [ ] Configure branch protection rules for dev: require status checks

- [ ] **Task 4: Set Up Frontend CI/CD Pipeline** (AC: 4, 5)
  - [ ] Create .github/workflows/ci.yml for linting and testing
  - [ ] Create .github/workflows/deploy.yml for Vercel deployment
  - [ ] Configure GitHub Actions triggers (push to dev/main, pull requests)
  - [ ] Set up Vercel project and link to GitHub repository
  - [ ] Configure environment variables in Vercel (VITE_API_URL, VITE_WS_URL, VITE_MAPBOX_TOKEN)
  - [ ] Test CI pipeline with dummy commit

- [ ] **Task 5: Set Up Backend CI/CD Pipeline** (AC: 4, 5)
  - [ ] Create .github/workflows/ci.yml for linting and testing
  - [ ] Create .github/workflows/deploy.yml for Docker build and ECS deployment
  - [ ] Configure GitHub Actions triggers (push to dev/main, pull requests)
  - [ ] Set up AWS ECR repository for Docker images
  - [ ] Configure GitHub Secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
  - [ ] Test CI pipeline with dummy commit

- [ ] **Task 6: Configure Secrets and Environment Management** (AC: 6)
  - [ ] Document environment variable requirements in both READMEs
  - [ ] Create .env.template files with all required variables (placeholder values)
  - [ ] Set up GitHub Secrets for CI/CD: AWS credentials, API keys, JWT secret
  - [ ] Document secret rotation policy and access control

- [ ] **Task 7: Configure Collaboration Settings** (AC: 7)
  - [ ] Create .github/ISSUE_TEMPLATE/ with bug report and feature request templates
  - [ ] Create .github/PULL_REQUEST_TEMPLATE.md with checklist (linting, tests, description)
  - [ ] Create CODEOWNERS file (require architecture/lead approval for critical files)
  - [ ] Configure team access permissions (admin, write, read roles)
  - [ ] Document contribution guidelines in CONTRIBUTING.md

- [ ] **Task 8: Verify Repository Setup**
  - [ ] Clone both repositories locally and verify structure
  - [ ] Run linting and test CI pipelines (even with empty tests)
  - [ ] Verify Vercel and AWS ECS deployment configurations
  - [ ] Share repository URLs and access instructions with development team

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

- **November 4, 2025**: Story 2.2 drafted - Repository setup scope defined with CI/CD pipelines, branching strategy, and deployment configurations
