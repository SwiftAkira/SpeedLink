# SpeedLink Wireframes - Complete Screen Documentation

**Project:** SpeedLink PWA  
**Created:** November 4, 2025  
**Purpose:** Visual wireframes for MVP implementation  
**Design System:** Stealth Mode (Lime Green on Black) + shadcn/ui

---

## 📱 Wireframe Index

1. **Main Map View** - Primary screen (90% of usage time)
2. **Party Management** - Create/join parties, member list
3. **Join Party Flow** - 6-digit code entry
4. **Alert History** - Community reports and past alerts
5. **Profile & Settings** - User preferences and privacy
6. **Onboarding Screens** - First-time user experience
7. **Alert System States** - 3-level alert visualizations

---

## Screen 1: Main Map View

### Layout Structure

\\\
┌─────────────────────────────────────┐
│ ● Connected  │  Party #847362  │ ⚙️ │ ← Top Bar (60px)
├─────────────────────────────────────┤
│                                     │
│           🗺️ MAP CANVAS             │
│                                     │
│     [Party Member Markers]          │ ← Map Container (Full)
│     [User Location (YOU)]           │
│     [Camera Icons]                  │
│                                     │
│  [Alert Banner Overlay - Dynamic]   │
│                                     │
├─────────────────────────────────────┤
│ ─────  (Swipe Handle)  ─────        │
│                                     │ ← Bottom Sheet
│ 👤 You        Motorcycle    0km  ●  │   (120px collapsed
│ 👤 Mike       Motorcycle  2.3km  ●  │    320px expanded)
│ 👤 Sarah      Car        1.8km  ●  │
│                                     │
├─────────────────────────────────────┤
│                              [📍]   │ ← FAB (56px)
├─────────────────────────────────────┤
│  🗺️    👥     🔔      👤            │ ← Bottom Nav (70px)
│  Map   Party  Alerts  Profile       │
└─────────────────────────────────────┘
\\\

### Component Specifications

**Top Bar:**
- Height: 60px
- Background: #171717 (dark gray)
- Border: 1px solid #262626

**Elements:**
- Connection Status: Green dot (12px) + "Connected"
- Party Code: #84CC16 (lime green), font-weight 600
- Settings Icon: 24px gear icon, right-aligned

**Map Canvas:**
- Background: Mapbox GL JS rendered map
- User Marker: 56px circle, #84CC16, pulsing animation
- Party Markers: 40px circles, #06B6D4 (cyan), with direction arrows
- Touch: Pinch zoom, drag pan, double-tap zoom

**Bottom Sheet:**
- Collapsed: 120px height (shows 2-3 members)
- Expanded: 320px height (full member list)
- Handle: 40px wide, 4px tall, centered
- Swipe Gesture: Up to expand, down to collapse

**FAB (Floating Action Button):**
- Size: 56px diameter
- Position: Bottom-right, 20px from edges, 90px from bottom
- Background: #84CC16
- Icon: Report/location pin, 24px
- Shadow: 0 4px 12px rgba(132,204,22,0.4)

**Bottom Navigation:**
- Height: 70px
- 4 items: Map, Party, Alerts, Profile
- Active state: #84CC16 icon + text, scale 1.1x
- Inactive: #FAFAFA with opacity 0.7

---

## Screen 2: Party Management

### Layout Structure

\\\
┌─────────────────────────────────────┐
│ Party Management      [Leave Party] │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  CURRENT PARTY                      │
│  ┌─────────────────────────────┐   │
│  │ Party Code                  │   │
│  │     847362                  │   │ ← Code Display
│  └─────────────────────────────┘   │
│  [📋 Copy Code]                     │
│                                     │
│  PARTY MEMBERS (3)                  │
│  ┌─────────────────────────────┐   │
│  │ Y  You         Motorcycle ● │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │ ← Member List
│  │ M  Mike        Motorcycle ● │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ S  Sarah       Car        ● │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Create New Party]                 │
│  [Join Another Party]               │
│                                     │
├─────────────────────────────────────┤
│  🗺️    ��     🔔      👤            │
└─────────────────────────────────────┘
\\\

### Component Specifications

**Party Code Display:**
- Background: #171717
- Border: 2px solid #262626
- Padding: 24px
- Code: 36px, font-weight 800, #84CC16
- Letter-spacing: 8px (for readability)

**Member List Items:**
- Height: 72px (generous touch target)
- Avatar: 48px circle with initial
- Name: 16px, font-weight 600
- Stats: 12px, #A3A3A3 (gray)
- Status Dot: 12px, #22C55E (green = online)

**Buttons:**
- Leave Party: Red (#DC2626), top-right, 8px padding
- Copy Code: Amber (#FBBF24), full-width
- Create New Party: Lime (#84CC16), full-width
- Join Another Party: Secondary (amber)

---

## Screen 3: Join Party Flow

### Layout Structure

\\\
┌─────────────────────────────────────┐
│ ← Back         Join Party            │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  ENTER PARTY CODE                   │
│                                     │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│   │ 8 │ │ 4 │ │ 7 │ │ 3 │ │ 6 │ │ 2 │  │ ← 6-Digit Input
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  │
│                                     │
│   [Join Party]                      │
│                                     │
│                                     │
│          🎉                          │
│   Ready to ride together!           │ ← Empty State
│                                     │
│   Enter the 6-digit code shared     │
│   by your party leader              │
│                                     │
│                                     │
└─────────────────────────────────────┘
\\\

### Component Specifications

**Code Input Boxes:**
- Size: 48px wide, 56px tall
- Background: #171717
- Border: 2px solid #262626
- Filled State: Border turns #84CC16 (lime green)
- Font: 24px, font-weight 700
- Gap: 8px between boxes

**Behavior:**
- Auto-advance to next box on input
- Numeric keyboard on mobile
- Paste detection (auto-fills all 6 digits)
- Submit button enabled when all 6 filled
- Error state: Red border + shake animation

**Join Button:**
- Full-width, 56px height
- Background: #84CC16 (lime green)
- Disabled state: 50% opacity until 6 digits entered

---

## Screen 4: Alert History

### Layout Structure

\\\
┌─────────────────────────────────────┐
│ Alert History                        │ ← Top Bar
├─────────────────────────────────────┤
│ [All] [Cameras] [Police] [Hazards]  │ ← Filter Tabs
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📷  Speed Camera                │ │
│ │     Highway 101 • 2 min ago     │ │ ← Alert Card
│ │                   👍 56  👎 3   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👮  Police Reported             │ │
│ │     Main St • 15 min ago        │ │
│ │                   👍 42  👎 1   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️  Road Hazard                 │ │
│ │     Oak Ave • 1 hour ago        │ │
│ │                   👍 28  👎 0   │ │
│ └─────────────────────────────────┘ │
│                                     │
│                              [➕]   │ ← FAB (Report)
├─────────────────────────────────────┤
│  🗺️    👥     🔔      👤            │
└─────────────────────────────────────┘
\\\

### Component Specifications

**Filter Tabs:**
- Horizontal scroll on mobile
- Active tab: #84CC16 background
- Inactive: #222 background
- Padding: 8px 16px
- Border-radius: 8px

**Alert Cards:**
- Background: #1a1a1a
- Border-radius: 12px
- Padding: 12px
- Icon: 32px emoji/icon
- Title: 16px, font-weight 600
- Details: 12px, #A3A3A3
- Votes: Right-aligned, 12px

**FAB:**
- Plus icon for "Report Alert"
- Black color on lime background
- Opens report modal

---

## Screen 5: Profile & Settings

### Layout Structure

\\\
┌─────────────────────────────────────┐
│ Profile & Settings                   │ ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  USER PROFILE                       │
│  ┌─────────────────────────────┐   │
│  │  Y   YourName               │   │
│  │      🏍️ Motorcycle Rider    │   │ ← Profile Card
│  └─────────────────────────────┘   │
│                                     │
│  PRIVACY                            │
│  ┌─────────────────────────────┐   │
│  │ Location Sharing            │   │
│  │ Party only                  │   │ ← Settings Items
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Visibility                  │   │
│  │ Visible in parties          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ALERT PREFERENCES                  │
│  ┌─────────────────────────────┐   │
│  │ Alert Sensitivity           │   │
│  │ Aggressive                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Voice Alerts                │   │
│  │ Enabled                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Logout]                           │ ← Danger Button
│                                     │
├─────────────────────────────────────┤
│  🗺️    👥     🔔      👤            │
└─────────────────────────────────────┘
\\\

### Component Specifications

**Profile Card:**
- Large avatar: 64px
- Background: Lime green for self
- Name: 20px, font-weight 700
- Vehicle type with icon

**Settings Items:**
- Height: 60px minimum
- Two-line format: Label + Current Value
- Tap to open modal/picker
- Background: #1a1a1a
- Border-radius: 12px

**Logout Button:**
- Red (#DC2626)
- Full-width
- Confirmation modal required

---

## Screen 6: Onboarding Screens

### 6A: Welcome Screen

\\\
┌─────────────────────────────────────┐
│                                     │
│                                     │
│          🏍️  SpeedLink              │
│                                     │
│     Ride together, stay safe        │
│                                     │ ← Hero Section
│   Real-time party tracking with     │
│   intelligent speed camera alerts   │
│                                     │
│                                     │
│  [Get Started]                      │
│  [I already have an account]        │
│                                     │
└─────────────────────────────────────┘
\\\

### 6B: Permissions Screen

\\\
┌─────────────────────────────────────┐
│ ← Skip                          1/3  │
├─────────────────────────────────────┤
│                                     │
│          📍                          │
│                                     │
│     Location Permission             │
│                                     │
│   SpeedLink needs your location     │
│   to show you on the map and        │
│   provide real-time alerts          │
│                                     │
│   We only share your location       │
│   when you're in a party            │
│                                     │
│  [Enable Location]                  │
│  [Maybe Later]                      │
│                                     │
└─────────────────────────────────────┘
\\\

### 6C: Profile Setup

\\\
┌─────────────────────────────────────┐
│ ← Back                          3/3  │
├─────────────────────────────────────┤
│                                     │
│     Choose Your Ride                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         🏍️                  │   │
│  │      Motorcycle             │   │ ← Vehicle Cards
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         🚗                  │   │
│  │         Car                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         🛵                  │   │
│  │       Scooter               │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Continue]                         │
│                                     │
└─────────────────────────────────────┘
\\\

---

## Screen 7: Alert System States

### Level 1: Calm Banner (Low Risk)

\\\
┌─────────────────────────────────────┐
│ ● Connected  │  Party #847362  │ ⚙️ │
├─────────────────────────────────────┤
│ 📷  Speed camera ahead         1.2km│ ← Amber Banner
├─────────────────────────────────────┤   (80px height)
│                                     │
│           🗺️ MAP VISIBLE            │
│                                     │
│     [Map content below banner]      │
│                                     │
└─────────────────────────────────────┘
\\\

**Specifications:**
- Background: #FBBF24 (amber)
- Text: Black (#000)
- Height: 80px
- Animation: None (static)
- Audio: Single soft beep

### Level 2: Prominent Banner (Medium Risk)

\\\
┌─────────────────────────────────────┐
│ ● Connected  │  Party #847362  │ ⚙️ │
├─────────────────────────────────────┤
│                                     │
│       📷                             │
│   ⚠️ CAMERA 800m                    │ ← Orange Banner
│   Slow down                         │   (150px height)
│                                     │   (Pulsing)
├─────────────────────────────────────┤
│                                     │
│        🗺️ MAP PARTIALLY VISIBLE     │
│                                     │
└─────────────────────────────────────┘
\\\

**Specifications:**
- Background: #F97316 (orange)
- Text: White (#fff)
- Height: 150px
- Animation: Pulse every 2s
- Audio: Three beeps, repeat every 5s

### Level 3: Full-Screen Takeover (HIGH RISK)

\\\
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│               📷                    │
│          (128px icon)               │
│                                     │
│        🚨 SPEED CAMERA              │
│          BRAKE NOW!                 │ ← RED FULL SCREEN
│                                     │   (Flashing)
│          200m ahead                 │
│                                     │
│                                     │
│       [Swipe down to dismiss]       │
│                                     │
│                                     │
└─────────────────────────────────────┘
\\\

**Specifications:**
- Background: #DC2626 (danger red)
- Text: White (#fff)
- Height: Full screen (blocks map)
- Animation: Flash every 1s
- Font: 24px title, 32px "BRAKE NOW", 800 weight
- Audio: LOUD repeating alarm
- Haptic: 300ms pulse pattern

---

## Navigation Flows

### Flow 1: First-Time User Journey

\\\
Welcome → Permissions → Profile Setup → Main Map → Create/Join Party
\\\

### Flow 2: Join Existing Party

\\\
Main Map → Party Tab → Join Party → Enter Code → Validate → Main Map (with party)
\\\

### Flow 3: Create New Party

\\\
Main Map → Party Tab → Create Party → Generate Code → Share Code → Wait for Members → Main Map (with party)
\\\

### Flow 4: Alert Interaction

\\\
Riding (Main Map) → Approach Camera → Alert Level 1 → Continue Speeding → Alert Level 2 → Still Speeding → Alert Level 3 → Brake/Slow Down → Alert Dismisses → Continue Riding
\\\

### Flow 5: Report Alert

\\\
Main Map → FAB → Report Type (Camera/Police/Hazard) → Location (auto) → Add Details → Submit → Main Map + Confirmation Toast
\\\

---

## Responsive Breakpoints

### Mobile (0-640px) - PRIMARY TARGET
- Single column layout
- Bottom sheet for party list
- Bottom navigation bar
- Full-screen modals
- Touch targets: 48-56px minimum

### Tablet (641-1024px)
- Map: 70% width
- Party list: 30% persistent sidebar (right)
- Bottom OR side navigation
- Modals: 600px max-width (not full-screen)

### Desktop (1025px+)
- Map: Main canvas
- Party list: 300px persistent sidebar (right)
- Top OR side navigation
- Keyboard shortcuts enabled
- Max container width: 1200px

---

## Interaction States

### Button States
- **Default:** Base color, no scale
- **Hover:** Brightness +10%, cursor pointer
- **Active:** Scale 0.98x
- **Disabled:** 50% opacity, no interaction
- **Loading:** Spinner replaces text

### Input States
- **Empty:** Gray border (#262626)
- **Focus:** Lime green border (#84CC16)
- **Filled:** Lime green border, text visible
- **Error:** Red border (#DC2626) + shake animation
- **Valid:** Green checkmark appears

### Card States
- **Default:** Background #1a1a1a
- **Hover:** Background #222
- **Active:** Background #2a2a2a, scale 0.99x
- **Selected:** Lime green border, 2px

---

## Accessibility Features

### Color Contrast
- All text meets WCAG 2.1 Level AA (4.5:1 minimum)
- Lime green #84CC16 on black #0C0C0C ✅
- White #FAFAFA on dark gray #171717 ✅
- Alert colors validated for readability

### Keyboard Navigation
- Tab order: Logical top-to-bottom flow
- Focus indicators: 2px lime green outline
- Skip to main content link
- All actions keyboard-accessible

### Screen Reader Support
- ARIA labels on all icons
- Semantic HTML (nav, main, aside)
- aria-live regions for alerts (assertive)
- aria-live for party updates (polite)

### Touch Targets
- Minimum 48px height (iOS HIG)
- Minimum 56px for critical actions
- 8px spacing between targets
- Designed for motorcycle gloves

---

## Design Tokens Reference

### Colors (Stealth Mode)
\\\
Primary:      #84CC16  (Lime Green)
Secondary:    #FBBF24  (Amber)
Accent:       #F97316  (Orange)
Danger:       #DC2626  (Red)
Success:      #22C55E  (Green)
Info:         #06B6D4  (Cyan)

Background:   #0C0C0C  (Near Black)
Surface:      #171717  (Dark Gray)
Border:       #262626  (Medium Gray)
Text:         #FAFAFA  (White)
Text Muted:   #A3A3A3  (Light Gray)
\\\

### Typography
\\\
Font Family:  System UI Stack
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

Base Size:    16px
Weights:      400 (Regular), 600 (Semibold), 700 (Bold), 800 (Extra Bold)

Headings:
  h1: 28px, 700
  h2: 20px, 600
  h3: 18px, 600

Body:
  Regular:     16px, 400
  Strong:      16px, 600
  Caption:     12px, 400
\\\

### Spacing (8px Base Unit)
\\\
xs:   8px   (0.5rem)
sm:   16px  (1rem)
md:   24px  (1.5rem)
lg:   32px  (2rem)
xl:   40px  (2.5rem)
2xl:  48px  (3rem)
\\\

### Border Radius
\\\
sm:   8px   (Buttons, small elements)
md:   12px  (Cards, inputs)
lg:   16px  (Modals, panels)
xl:   20px  (Bottom sheets)
full: 50%   (Circles, pills)
\\\

### Shadows
\\\
sm:   0 1px 2px rgba(0,0,0,0.3)
md:   0 4px 6px rgba(0,0,0,0.4)
lg:   0 10px 15px rgba(0,0,0,0.5)
xl:   0 20px 25px rgba(0,0,0,0.6)

Glow:
  lime: 0 4px 12px rgba(132,204,22,0.4)
\\\

---

## Implementation Notes

### Critical Path
1. **Main Map View** - Core 90% experience
2. **Party Management** - Essential for MVP
3. **Alert System** - Defining feature
4. **Join/Create Flows** - User onboarding

### Nice-to-Have (Phase 2)
- Alert History (can be simple list first)
- Profile Settings (basic profile is enough)
- Community Voting (can start without)

### Technical Considerations
- Map uses Mapbox GL JS
- WebSocket for real-time party updates
- Service Worker for offline PWA
- Location API with high accuracy
- Audio API for alert sounds

### Performance Targets
- Party updates: ≤800ms latency
- Map render: 60 FPS
- Alert response: Instant (<100ms)
- Battery efficient: GPS smart polling

---

**Status:** ✅ Complete - Ready for development handoff  
**Next Steps:** Interactive prototype testing, developer implementation  
**Contact:** Sally, UX Designer

