# SpeedLink MVP Roadmap (7 Days)# SpeedLink MVP Roadmap (7 Days)



## Tech Stack## Overview

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSSThis document outlines the 7-day MVP delivery plan for SpeedLink, a mobile-first PWA for real-time group navigation and safety alerts.

- **Backend**: Supabase (PostgreSQL + Real-time + Auth)

- **Mapping**: Mapbox GL JS## Roadmap Table

- **Hosting**: Vercel (free tier)| Day | Focus | Key Tasks |

|-----|-------|----------|

---| 1 | Planning & Architecture | Finalize MVP features, define stack, design architecture |

| 2 | Design & Setup | Wireframes, repo setup, scaffold PWA/backend, mapping SDK |

## Week 1 Development Plan| 3 | Core Feature Dev | Auth, party/group creation, live map, backend real-time |

| 4 | Alerts & Community | Alerts system, community reporting, push notifications |

### Day 1: Planning & Setup ✅| 5 | Navigation & Messaging | Route navigation, in-app messaging, privacy controls |

- [x] Define MVP features| 6 | Testing & Polish | Internal testing, bug fixes, performance, legal/privacy |

- [x] Choose tech stack (Next.js + Supabase)| 7 | Finalize & Release | UAT, docs, deploy MVP, collect feedback |

- [ ] Create Supabase project

- [ ] Initialize Next.js app with PWA config## Mermaid Gantt Chart

```mermaid

### Day 2: Authentication & Setupgantt

- [ ] Set up Supabase authentication    title SpeedLink MVP 7-Day Roadmap

- [ ] Implement email/password login    dateFormat  YYYY-MM-DD

- [ ] Create user profile page    section Planning & Architecture

- [ ] Configure Vercel deployment    Finalize MVP Features      :done,    des1, 2025-11-04, 1d

    section Design & Setup

### Day 3: Party/Group Features    Wireframes & Setup         :done,    des2, 2025-11-05, 1d

- [ ] Party creation with 6-digit codes    section Core Feature Dev

- [ ] Join party flow    Auth & Live Map            :active,  dev1, 2025-11-06, 1d

- [ ] Party member list    Backend Real-Time          :         dev2, 2025-11-06, 1d

- [ ] Leave party functionality    section Alerts & Community

    Alerts & Community         :         dev3, 2025-11-07, 1d

### Day 4: Real-Time Map    section Navigation & Messaging

- [ ] Integrate Mapbox GL JS    Navigation & Messaging     :         dev4, 2025-11-08, 1d

- [ ] Implement location tracking    section Testing & Polish

- [ ] Set up Supabase real-time subscriptions    Testing & Polish           :         test1, 2025-11-09, 1d

- [ ] Display party members on map    section Finalize & Release

    UAT & Release              :         rel1, 2025-11-10, 1d

### Day 5: Speed Camera Alerts```

- [ ] Create speed camera database

- [ ] Implement proximity detection## Notes

- [ ] Add alert notifications- Focus on core features only for MVP.

- [ ] Test alert accuracy- Use AI tools to accelerate all phases.

- Daily check-ins to adjust and unblock.
### Day 6: Testing & Polish
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] PWA installation testing
- [ ] Performance optimization

### Day 7: Deploy & Document
- [ ] Production deployment to Vercel
- [ ] Write user documentation
- [ ] Create quick start guide
- [ ] Collect initial feedback

---

## Gantt Chart

```mermaid
gantt
    title SpeedLink MVP 7-Day Roadmap
    dateFormat YYYY-MM-DD
    section Setup
    Planning & Stack      :done, day1, 2025-11-04, 1d
    section Auth
    Authentication        :day2, 2025-11-05, 1d
    section Party
    Party Features        :day3, 2025-11-06, 1d
    section Map
    Real-Time Map         :day4, 2025-11-07, 1d
    section Alerts
    Speed Cameras         :day5, 2025-11-08, 1d
    section Test
    Testing & Polish      :day6, 2025-11-09, 1d
    section Deploy
    Deploy & Document     :day7, 2025-11-10, 1d
```

---

## Success Criteria

- ✅ Real-time location updates with ≤800ms latency
- ✅ Party creation and joining works smoothly
- ✅ Speed camera alerts trigger correctly
- ✅ PWA installable on mobile devices
- ✅ Deployed and accessible via HTTPS
- ✅ $0 hosting cost (free tiers)

---

## Post-MVP Features (Weeks 2-4)

- Community reporting system
- In-app messaging
- Route navigation
- Emergency/SOS button
- Advanced privacy controls
