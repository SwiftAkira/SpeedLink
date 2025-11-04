# SpeedLink UX Design Specification

**Project:** SpeedLink  
**Date:** November 4, 2025  
**Designer:** Sally (UX Designer Agent)  
**Status:** In Progress

---

## 1. Project Vision & User Understanding

### Project Summary
SpeedLink is a mobile-first Progressive Web App (PWA) for real-time group navigation and speed camera alerts, designed for motorcycle riders and spirited drivers who want to travel together, avoid fines, and stay connected.

### Target Users
- Motorcycle riders and drivers
- Tech-savvy enthusiasts
- Confident, slightly rebellious personalities
- Group riders who coordinate together
- Users who want to outsmart speed enforcement

### Core Experience
**"Riding together, aware of everything"** - The seamless combination of:
- Real-time party tracking with ultra-low latency (≤800ms)
- Intelligent, context-aware speed camera warnings
- Multiplayer navigation with aggressive protection

### Emotional Goals
Users should feel:
1. **Empowered & Outsmarting** - "I'm beating the system, avoiding fines like a pro"
2. **Connected & In-Sync** - "My crew is right there with me, we're riding together"
3. **Confident & Protected** - "I've got eyes everywhere, nothing surprises me"
4. **Having Fun** - That rebellious edge of being smarter than enforcement

---

## 2. Platform & Technical Context

### Platform
- **Primary:** Mobile-first PWA (Progressive Web App)
- **Devices:** iOS, Android smartphones (motorcycle/car mounted)
- **Installation:** Installable via browser, bypasses app store restrictions
- **Usage Context:** While riding/driving at speed, often in sunlight, hands-free operation critical

### Technical Requirements
- React + Vite frontend
- Mapbox GL JS for mapping
- WebSocket for real-time updates
- ≤800ms latency for party location updates
- Battery-efficient background location tracking

---

## 3. Inspiration & UX Patterns

### Reference Apps Analyzed

**Waze:**
- ✅ Community-driven alerts with real-time reporting
- ✅ Playful, gamified UX with points and achievements
- ✅ Instant visual feedback with distance indicators
- ✅ Social trust via upvote/downvote on reports
- ✅ Voice alerts for hands-free usage

**Flitsmeister:**
- ✅ Ultra-precise camera warnings with exact distances
- ✅ LOUD audio alerts - unmistakable, different sounds per camera type
- ✅ Real-time police reporting by community
- ✅ Speed limit awareness always visible
- ✅ Minimal distraction - audio-first while driving

**AMap (Gaode):**
- ✅ Insanely accurate real-time traffic intelligence
- ✅ Lane guidance showing exact lane positioning
- ✅ POI recommendations integrated
- ✅ Group navigation with shared routes
- ✅ Celebrity/character voice packages

### Key UX Principles Extracted
- **Audio-First:** Critical info via sound, not requiring eyes on screen
- **Community Trust:** Real users reporting real conditions right now
- **Immediate Alerts:** No delay between threat detection and warning
- **Map Clarity:** Easy to glance and understand situation instantly
- **Hands-Free:** Works while focused on the road

---

## 4. Visual Foundation

### Color Theme: Stealth Mode

**Personality:** Tactical, sharp, under-the-radar vibes - like night vision goggles or military HUD. Serious about avoiding detection while maintaining high energy.

#### Color Palette

**Primary Colors:**
- **Primary (Lime Green):** #84CC16 - Main actions, key UI elements, active states
- **Secondary (Amber):** #FBBF24 - Supporting actions, medium-priority warnings
- **Accent (Orange):** #F97316 - Alerts, urgent notifications

**Semantic Colors:**
- **Success (Green):** #22C55E - Confirmations, positive feedback
- **Warning (Yellow):** #EAB308 - Cautions, medium-risk alerts
- **Danger (Red):** #DC2626 - LOUD camera/police warnings, high-risk situations

**Neutrals:**
- **Background:** #0C0C0C - Near black for minimal light pollution
- **Card Background:** #171717 - Dark gray for content containers
- **Text Primary:** #FAFAFA - Off-white for high readability
- **Text Secondary:** #A3A3A3 - Gray for supporting text
- **Border:** #262626 - Subtle separators

**Rationale:** High contrast lime green on black provides excellent visibility in bright sunlight (critical for outdoor motorcycle use), tactical aesthetic reinforces "outsmarting the system" feeling, pure blacks minimize battery drain on OLED screens.

### Typography System

**Font Stack:** System fonts for optimal performance and native feel
- iOS: San Francisco
- Android: Roboto
- Desktop: Segoe UI
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Font Weights:**
- 400 (Regular): Body text, descriptions
- 600 (Semibold): Buttons, labels, emphasis
- 700 (Bold): Headers, important callouts
- 800 (Extra Bold): Critical alerts, LOUD warnings

**Type Scale:**
- h1: 32px / 2rem - Main screens, hero content
- h2: 24px / 1.5rem - Section headers
- h3: 20px / 1.25rem - Card headers, sub-sections
- body: 16px / 1rem - Main content, readable text
- small: 14px / 0.875rem - Supporting info, timestamps
- tiny: 12px / 0.75rem - Fine print, metadata

**Line Heights:**
- Headers: 1.2 (tight for impact)
- Body: 1.6 (readable for longer text)
- Alerts: 1.4 (balanced for urgency + readability)

**Rationale:** System fonts provide instant rendering, native feel, and optimal performance. Bold weights for alerts ensure glanceability at speed. Large base size (16px) ensures readability while riding.

### Layout Foundation

**Spacing System:** 8px base unit
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 40px
- 2xl: 48px
- 3xl: 64px

**Layout Grid:**
- Mobile: Single column, full-width content
- Tablet: 2-column where appropriate
- Desktop: Max-width 1200px container, centered

**Touch Targets:**
- Minimum: 44x44px (iOS HIG standard)
- Preferred: 48x48px (Material Design standard)
- Critical actions: 56x56px+ for easy thumb reach while riding

**Rationale:** 8px base unit ensures consistent visual rhythm. Large touch targets critical for use with gloves or while bike is vibrating. Mobile-first approach reflects primary use case.

---

## 5. Design System Choice

**Selected:** shadcn/ui + Tailwind CSS

**Rationale:**
- ✅ Perfect for custom themes like Stealth Mode - full color control
- ✅ Accessible by default with keyboard navigation built-in
- ✅ Modern, minimal, performant
- ✅ Easy to create LOUD alerts and bold UI
- ✅ Built for React (matches tech stack)
- ✅ Handles dark mode perfectly
- ✅ Won't fight customization - tactical aesthetic achievable

**Components Provided:**
- Buttons (primary, secondary, danger variants)
- Forms (inputs, selects, checkboxes, radio)
- Modals and dialogs
- Cards and containers
- Navigation components
- Toast notifications
- Alerts and banners

**Customization Needs:**
- Map overlay components (party member markers, alert overlays)
- Context-aware alert system (calm banner → full-screen takeover)
- Real-time connection status indicators
- Party member list with online/offline states
- Speed camera icon variants (fixed, mobile, reported)

---

## 6. Defining Experience & Core Interactions

### The Defining Experience
**"Multiplayer navigation with intelligent protection"**

SpeedLink combines three experiences that are typically separate:
1. **Party Coordination** - Creating/joining groups with 6-digit codes
2. **Real-Time Awareness** - Live map showing all party members (≤800ms updates)
3. **Intelligent Alerts** - Context-aware camera warnings based on actual risk

This is NOT:
- Just navigation (like Google Maps)
- Just alerts (like Flitsmeister)
- Just social tracking (like Find My Friends)

It's the seamless fusion of all three with attitude and intelligence.

### Primary User Flow
1. **Open app** → See map with your current location
2. **Join or create party** → Enter 6-digit code or generate new
3. **Main screen active** → Live map showing:
   - Your location (always centered or follow mode)
   - All party members with real-time positions
   - Speed, direction, distance indicators
   - Alert overlays when approaching cameras
4. **Ride together** → Continuous real-time updates, automatic alerts
5. **Leave party** → Exit cleanly, location sharing stops

**Users spend 90% of time on:** Main map screen with party + alerts active

---

## 7. Intelligent Alert System (DEFINING FEATURE)

### Context-Aware Alert Intensity

SpeedLink's alert system is **intelligent** - it adapts urgency based on actual risk calculated from:
- User's current speed vs posted speed limit
- Distance to camera/hazard
- Time to impact
- Whether user is actively braking

### Alert Levels

#### Level 1: Calm Banner (Low Risk)
**Trigger:** User is 0-15 km/h over limit, OR camera is 2km+ away

**Visual:**
- Slim banner across top of map (80px height)
- Amber/yellow background (#FBBF24)
- Single camera icon + distance text
- "Speed camera ahead - 1.2km"
- Map remains fully visible below
- No animation, static display

**Audio:**
- Single soft beep
- Optional voice: "Camera ahead"

**Rationale:** Don't cry wolf on minor infractions. User has plenty of time to adjust. Keep map visible for navigation.

---

#### Level 2: Prominent Banner (Medium Risk)
**Trigger:** User is 15-30 km/h over limit, OR camera is 500m-1km away

**Visual:**
- Large banner across top third of map (150px height)
- Orange background (#F97316)
- Pulsing animation (subtle pulse every 2s)
- Camera icon + distance + "Slow down" text
- "⚠️ CAMERA 800m - Slow down"
- Map visible but alerts dominate attention
- Bold typography (font-weight: 700)

**Audio:**
- Three beeps in sequence
- Repeated every 5 seconds
- Voice: "Speed camera ahead, slow down"

**Rationale:** Get user's attention without panic. They need to act but have time. Pulsing creates urgency without full screen takeover.

---

#### Level 3: Full-Screen Takeover (HIGH RISK)
**Trigger:** User is 30+ km/h over limit, OR camera is <500m away at high speed

**Visual:**
- **FULL SCREEN RED** (#DC2626)
- Map completely obscured
- Massive camera icon (128px)
- Extra bold text (font-weight: 800)
- "🚨 SPEED CAMERA - BRAKE NOW!"
- Distance counting down in real-time
- Aggressive pulsing/flashing animation (1s intervals)
- Vibration pattern if device supports (300ms pulse)

**Audio:**
- LOUD repeating alarm (siren-like)
- Repeats every 2 seconds until user slows
- Voice: "BRAKE NOW! Speed camera ahead!"
- Maximum volume override if possible

**Dismiss Behavior:**
- Auto-dismisses when speed drops below threshold
- OR when user passes camera location
- Manual dismiss requires deliberate action (swipe down)

**Rationale:** CANNOT BE MISSED. User is in real danger of getting ticketed/fined. Full attention required. Override everything else. This is the "friend yelling at you" moment.

---

### Smart Alert Logic

**Distance-Based Escalation:**
`
2km warning: Level 1 (calm, FYI)
1km warning: Level 1 or 2 (depends on speed)
500m warning: Level 2 or 3 (escalates if still speeding)
200m warning: Level 3 (URGENT, last chance)
`

**Speed-Based Calculation:**
`
speed_over_limit = current_speed - posted_limit
risk_score = (speed_over_limit) × (1000 / distance_to_camera)

if risk_score < 15: Level 1
if 15 ≤ risk_score < 40: Level 2  
if risk_score ≥ 40: Level 3
`

**Additional Intelligence:**
- **Braking Detection:** If user is actively braking (deceleration detected), reduce urgency by one level
- **Camera Type:** Mobile police traps escalate faster than fixed cameras
- **Road Type:** Highway cameras have higher thresholds than urban (different expectations)
- **Party Sync:** If party member just got flashed/ticketed, all members get Level 3 warning for that location

**Community Reporting:**
- User can report camera after passing
- Reports instantly shared with entire party
- Upvote/downvote system for accuracy
- False reports flagged and user trust score adjusted

---

## 8. Screen Layouts & Navigation

### Mobile-First Navigation Pattern

**Bottom Navigation Bar** (Always visible on main screens)
- **Map** (home icon) - Main screen, party + map view
- **Party** (users icon) - Party management, member list
- **Alerts** (bell icon) - Alert history, community reports  
- **Profile** (person icon) - Settings, privacy, logout

**Rationale:** Bottom navigation for thumb reach while device is mounted. Standard mobile pattern, familiar to users. Critical screens accessible in one tap.

### Main Map Screen (Primary View - 90% of usage time)

**Layout Components:**

**Top Bar (Fixed, 60px):**
- Connection status indicator (green dot = connected, yellow = reconnecting, red = offline)
- Party code display (e.g., "Party #847362")
- Settings gear icon (top-right)

**Map Canvas (Full screen behind everything):**
- Mapbox GL JS integration
- User location marker (lime green pulse)
- Party member markers (color-coded, with direction arrows)
- Camera/hazard icons on map
- Alert overlays (Level 1-3 depending on risk)

**Bottom Sheet (Collapsible, 120px collapsed / 40% expanded):**
- Party member list (collapsed view shows 2-3 members)
- Swipe up to expand full list
- Each member shows: username, vehicle type, distance, speed, online status
- Tap member to center map on them

**Floating Action Button (Bottom-right, 56px):**
- Quick actions: Report camera, SOS alert, Quick chat
- Lime green with drop shadow
- Always accessible

**Connection Status Banner (Conditional, top):**
- Only shows if connection issues
- "Reconnecting..." with spinner
- "Offline - location queue active" 

**Alert Overlays (Conditional, varies by level):**
- Renders over map based on risk level (see Alert System section)
- Level 1: Top banner
- Level 2: Large top banner
- Level 3: Full screen takeover

---

### Party Management Screen

**Layout:**

**Header:**
- "Your Party" title
- Leave party button (top-right, red)

**Create Party Section:**
- Large button: "Create New Party"
- Generates 6-digit code
- Shows code in large font with "Copy Code" action

**Join Party Section:**
- 6-digit numeric keypad input
- "Join Party" button (disabled until 6 digits entered)
- Error feedback for invalid codes

**Active Party Section (if in party):**
- Party code with copy action
- Member count: "5 riders connected"
- Full member list with:
  - Avatar/initial circle
  - Username
  - Vehicle type icon
  - Online status (green dot)
  - Last seen timestamp if stale (>10s)

**Empty State (no party):**
- Friendly illustration
- "Ride together, stay safe"
- Prompts: "Create a party or join your crew"

---

### Alert History Screen

**Layout:**

**Filter Bar:**
- Tabs: "All" | "Cameras" | "Police" | "Hazards"
- Time filter dropdown: "Today" | "This week" | "All time"

**Alert Feed:**
- Chronological list of alerts
- Each alert card shows:
  - Icon (camera, police, hazard type)
  - Alert type and location
  - Timestamp and distance
  - Community votes (👍 56 | 👎 3)
  - Tap to view on map

**Reporting Section:**
- Floating Action Button: "Report Alert"
- Quick report types: Camera, Police, Hazard, Road condition
- Location auto-populated, user adds details

---

### Profile & Settings Screen

**Sections:**

**User Profile:**
- Username (editable)
- Vehicle type selector
- Riding style preference

**Privacy Controls:**
- Visibility toggle: "Visible" | "Hidden" in parties
- Location sharing: "Always" | "Party only" | "Off"
- Ghost mode toggle

**Alert Preferences:**
- Audio volume slider
- Voice alerts on/off
- Haptic feedback on/off
- Alert sensitivity: "Aggressive" | "Balanced" | "Calm"

**App Settings:**
- Dark mode (default on for Stealth theme)
- Map style
- Language
- Units (km/h or mph)

**Account:**
- Logout button
- Delete account (destructive)

---

## 9. Component Library & Custom Components

### From shadcn/ui (Standard Components)

**Buttons:**
- Primary: Lime green background, black text
- Secondary: Amber background, black text  
- Danger: Red background, white text
- Ghost: Transparent with border
- All variants: 44px min height, rounded-lg, font-weight 600

**Forms:**
- Input fields with floating labels
- Validation states (error shows red border + message)
- Disabled states (50% opacity)

**Cards:**
- Dark background (#171717)
- Subtle border (#262626)
- 16px padding, rounded-xl

**Modals:**
- Overlay with backdrop blur
- Centered card with close button
- Trap focus, ESC to dismiss

---

### Custom Components (SpeedLink-Specific)

#### 1. Party Member Marker (Map Overlay)
**Purpose:** Show party member's location on map with direction/speed

**Anatomy:**
- Circular avatar base (40px diameter)
- Direction arrow overlay (pointing travel direction)
- Speed badge (bottom-right corner)
- Pulsing animation if moving
- Username label below (on tap)

**States:**
- Active (moving): Pulsing animation, green border
- Stationary: Static, gray border
- Stale (>10s): Yellow border, "Last seen 15s ago"
- Offline: Red border, grayed out

**Variants:**
- Self (you): Lime green with larger size (56px)
- Party members: Cyan/blue with standard size (40px)

---

#### 2. Alert Banner (Top Overlay)
**Purpose:** Display camera/hazard alerts with context-aware intensity

**Anatomy:**
- Full-width banner
- Icon (left): Camera, police, hazard type
- Text (center): Alert message + distance
- Dismiss (right): X button or swipe down

**States:**
- Level 1 (Calm): 80px height, amber, static
- Level 2 (Medium): 150px height, orange, pulsing
- Level 3 (Critical): Full screen, red, aggressive animation

**Variants:**
- Camera alert (fixed camera icon)
- Police alert (police car icon)
- Hazard alert (warning triangle)
- Community report (user icon)

**Behavior:**
- Auto-dismiss after passing alert location
- Manual dismiss via swipe down gesture
- Distance updates in real-time

---

#### 3. Connection Status Indicator
**Purpose:** Show real-time connection health

**Anatomy:**
- Small dot (12px) with label
- Positioned in top bar

**States:**
- Connected: Green dot, no label (default, good)
- Reconnecting: Yellow dot, "Reconnecting..." with spinner
- Offline: Red dot, "Offline" label
- High latency: Orange dot, "Slow connection - 1200ms"

**Behavior:**
- Color changes based on WebSocket connection
- Latency shown if >800ms threshold exceeded
- Tap to view connection details

---

#### 4. Party Member List Item
**Purpose:** Display member in party list with status

**Anatomy:**
- Avatar circle (48px) with initial or icon
- Username (bold, 16px)
- Vehicle type icon below name
- Status indicator (right): online dot, distance, speed
- Last seen timestamp if stale

**States:**
- Online: Green dot, real-time distance/speed
- Stale: Yellow dot, "Last seen Xs ago"
- Offline: Red dot, "Offline"

**Variants:**
- Self (you): Lime green background, "You" label
- Party leader: Crown icon badge

**Interactions:**
- Tap: Center map on member
- Long press: Quick actions (message, remove if leader)

---

#### 5. 6-Digit Party Code Input
**Purpose:** Enter party code to join

**Anatomy:**
- 6 boxes in a row
- Large numeric font (32px)
- Auto-advances to next box on input
- Paste support (detects 6-digit code)

**States:**
- Empty: Gray border
- Filled: Lime green border
- Error: Red border with shake animation
- Valid: Green checkmark appears

**Behavior:**
- Mobile keyboard: Numeric only
- Auto-submit when 6 digits entered
- Error feedback: "Party not found" or "Party full"

---

## 10. UX Pattern Decisions

### Button Hierarchy
**Primary Action:** Lime green background, black text, font-weight 600
- Use for: Join party, Create party, Submit, Confirm

**Secondary Action:** Amber background, black text, font-weight 600
- Use for: Cancel (non-destructive), Back, Alternative path

**Destructive Action:** Red background, white text, font-weight 600
- Use for: Leave party, Delete, Remove (requires confirmation)

**Ghost Action:** Transparent, lime green text, border
- Use for: Tertiary actions, "Learn more", optional steps

**Rationale:** Clear visual hierarchy. Primary action unmistakable. Red reserved for destructive only. Ghost for de-emphasized actions.

---

### Feedback Patterns

**Success Feedback:**
- Toast notification (bottom): Green background, checkmark icon
- "✅ Joined party successfully"
- Auto-dismiss after 3 seconds
- Subtle haptic if supported

**Error Feedback:**
- Toast notification (bottom): Red background, X icon  
- Clear error message explaining what went wrong
- Persists until user dismisses (swipe or tap X)
- Shake animation on input field if applicable

**Loading States:**
- Skeleton screens for content loading
- Spinner for actions (button shows spinner in place of text)
- Progress bar for multi-step processes
- Never block UI - show optimistic updates when safe

**Info Feedback:**
- Toast notification (bottom): Blue background, info icon
- "ℹ️ Connection restored"
- Auto-dismiss after 5 seconds

**Rationale:** Consistent feedback builds trust. Users always know what's happening. Bottom toasts don't obscure map. Auto-dismiss for non-critical, persist for errors.

---

### Form Patterns

**Label Position:** Floating labels (appear above input on focus)

**Required Fields:** Asterisk (*) + "Required" label

**Validation Timing:**
- On blur (after user leaves field)
- On submit (all fields validated)
- Never on input (don't interrupt typing)

**Error Display:**
- Inline below field: Red text with icon
- Clear message: "Email must be valid format"
- Field border turns red

**Help Text:**
- Caption below field (gray text)
- Tooltip icon for complex fields

**Rationale:** Floating labels save space on mobile. Blur validation provides instant feedback without interrupting. Clear error messages help user fix quickly.

---

### Modal Patterns

**Size Variants:**
- Small: 400px max-width (confirmations)
- Medium: 600px max-width (forms)
- Large: 800px max-width (detailed content)
- Full-screen: Mobile only, slides up from bottom

**Dismiss Behavior:**
- Click outside overlay: Dismisses (unless form with unsaved changes)
- ESC key: Dismisses
- Explicit close button: Always present (top-right X)

**Focus Management:**
- Auto-focus first input field
- Trap focus within modal (can't tab outside)
- Restore focus to trigger element on close

**Stacking:**
- Only one modal at a time
- New modal replaces current (with transition)
- Exception: Critical error modal can stack over action modal

**Rationale:** Standard patterns = intuitive. Focus trapping for accessibility. Single modal prevents confusion. Click-outside dismissal for convenience.

---

### Navigation Patterns

**Active State Indication:**
- Bottom nav: Lime green icon + label
- Underline or background highlight
- Icon scales slightly (1.1x) on active

**Back Button Behavior:**
- Browser back: Works as expected (history stack)
- App back: Top-left arrow returns to previous screen
- Gesture: Swipe right from edge (mobile)

**Deep Linking:**
- Party codes: speedlink.app/join/847362
- Alert locations: speedlink.app/alert/lat,lng
- Share party: Generates link for easy sharing

**Rationale:** Clear active state prevents confusion. Back button respects user expectations. Deep links enable sharing and bookmarking.

---

### Empty State Patterns

**First Use (New User):**
- Friendly illustration or icon
- Clear headline: "Start riding together"
- Explanation: "Create a party or join your crew"
- Primary CTA: "Create Party" button
- Secondary action: "Join Existing Party"

**No Results (Search/Filter):**
- "No alerts found"
- Helpful message: "Try adjusting your filters"
- Clear filters button
- Or: "Be the first to report"

**Cleared Content (Deleted/Removed):**
- "Party ended"
- "Your party has disbanded"
- Action: "Create new party" or "Join another"

**Rationale:** Empty states guide user action. Never leave user confused. Always provide next step. Friendly tone reduces frustration.

---

### Confirmation Patterns

**Delete/Leave Party:**
- Always confirm with modal
- Clear warning: "Are you sure? You'll stop sharing location."
- Danger button: "Leave Party"
- Safe button: "Cancel" (default focused)

**Unsaved Changes:**
- Warn before navigation: "Discard changes?"
- Options: "Stay" | "Discard"
- Exception: Auto-save implemented, no warning needed

**Irreversible Actions:**
- Double confirmation for critical (delete account)
- Type confirmation: "Type DELETE to confirm"

**Rationale:** Prevent accidental destructive actions. Give user chance to reconsider. Critical actions require deliberate intent.

---

### Notification Patterns

**Placement:** Bottom of screen (above navigation if visible)

**Duration:**
- Success: 3 seconds auto-dismiss
- Info: 5 seconds auto-dismiss
- Warning: 10 seconds or manual dismiss
- Error: Manual dismiss only (persists until user acts)

**Stacking:** 
- Queue multiple notifications (show one at a time)
- Max 3 in queue, oldest dismissed if exceeded

**Priority Levels:**
- Critical (alert warnings): Override everything
- Important (party events): Show immediately
- Info (updates): Queue normally

**Rationale:** Bottom placement doesn't obscure map. Time-based dismiss for non-critical. Errors persist = user must acknowledge. Queue prevents overwhelming user.

---

### Search/Filter Patterns

**Search Behavior:**
- Instant search (as you type, debounced 300ms)
- Results update live
- Clear button appears when text entered

**Filters:**
- Slide-out panel (mobile) or sidebar (desktop)
- Applied filters shown as chips (removable)
- "Clear all" button when multiple filters active
- Filter count badge on filter button

**No Results:**
- Clear message + suggestions
- "Adjust filters" or "Clear filters" action

**Rationale:** Instant search feels fast and responsive. Visual filter chips show what's applied. Easy to modify or clear.

---

### Date/Time Patterns

**Format:**
- Relative for recent: "2 min ago", "Just now"
- Absolute for older: "Nov 4, 2:30 PM"
- Threshold: Use relative for <24 hours

**Timezone:**
- Always show user's local time
- Backend stores UTC, frontend converts

**Pickers:**
- Native date/time pickers (mobile)
- Calendar dropdown (desktop)
- Time slider for time-based filters

**Rationale:** Relative time more intuitive for recent activity. Local time prevents confusion. Native pickers leverage OS patterns.

---

## 11. Responsive & Accessibility Strategy

### Responsive Design

**Breakpoints:**
- **Mobile:** 0-640px (1-column layout, bottom nav)
- **Tablet:** 641-1024px (2-column where appropriate, side nav option)
- **Desktop:** 1025px+ (max-width 1200px container, side nav)

**Adaptation Patterns:**

**Mobile (Primary Target):**
- Full-screen map
- Bottom sheet for party list (collapsible)
- Bottom navigation bar
- Alert banners overlay map
- All content single-column
- Touch targets 48px+ minimum

**Tablet:**
- Map takes 70% width
- Party list persistent panel (30% right side)
- Bottom navigation OR side navigation
- Alert banners still overlay map
- Modal dialogs larger, not full-screen

**Desktop:**
- Map takes main canvas
- Party list persistent sidebar (300px right)
- Top navigation bar OR side navigation
- Alert banners overlay map (smaller relative size)
- Keyboard shortcuts enabled (ESC, arrow keys)

**Rationale:** Mobile-first reflects primary use case (mounted on bike/car). Larger screens add persistent panels rather than hiding. Map always primary focus.

---

### Accessibility Strategy

**Compliance Target:** WCAG 2.1 Level AA

**Rationale:** Level AA is recommended standard and legally required for government/education/public sites. Achievable for most content without extreme measures (AAA often impractical).

---

#### Color Contrast Requirements

**Normal Text (16px):** 4.5:1 minimum contrast ratio
- Primary on background: #84CC16 on #0C0C0C ✅ (Passes)
- Text on cards: #FAFAFA on #171717 ✅ (Passes)
- Secondary text: #A3A3A3 on #171717 ⚠️ (Check in implementation)

**Large Text (24px+ or 18px bold):** 3:1 minimum
- All headings pass with lime green or white on dark

**Alert Colors:**
- Danger red: #DC2626 on #0C0C0C ✅
- Warning amber: #FBBF24 on #0C0C0C ⚠️ (May need darkening for text)
- Success green: #22C55E on #0C0C0C ✅

**Action:** Validate all color combinations with contrast checker during implementation. Adjust shades if needed to meet 4.5:1 for normal text.

---

#### Keyboard Navigation

**All Interactive Elements:**
- Tab order follows logical flow (top to bottom, left to right)
- Skip to main content link (first tab stop)
- Tab through buttons, inputs, links in order
- Shift+Tab to reverse

**Focus Indicators:**
- Visible focus ring on all interactive elements
- Lime green outline (2px solid #84CC16)
- 2px offset from element edge
- Never hide focus styles

**Keyboard Shortcuts:**
- ESC: Close modal, dismiss alert (non-critical)
- Enter: Submit form, activate button
- Space: Activate button, toggle checkbox
- Arrow keys: Navigate map (when map has focus)
- Tab: Move focus, cycle through elements
- / : Focus search field (when available)

---

#### Screen Reader Support

**ARIA Labels:**
- All icons have aria-label: "Speed camera alert"
- Button purpose clear: aria-label="Join party #847362"
- Status indicators: aria-live="polite" for updates

**Semantic HTML:**
- Proper heading hierarchy (h1 → h2 → h3, no skips)
- Lists use <ul>/<ol> elements
- Forms use <form> with proper labels
- Regions marked: <nav>, <main>, <aside>

**Dynamic Content:**
- Alert banners: aria-live="assertive" (interrupts)
- Party member updates: aria-live="polite" (waits)
- Loading states: aria-busy="true"
- Error messages: aria-describedby on input

**Images:**
- Alt text for all meaningful images
- Decorative images: alt="" or aria-hidden="true"
- Icons: aria-label describes purpose

---

#### Form Accessibility

**Labels:**
- Every input has associated <label> element
- for/id attributes properly linked
- Label visible (no placeholder-only)

**Required Fields:**
- aria-required="true" on input
- Visual indicator (* or "Required")

**Validation:**
- Error messages: aria-describedby links to error text
- Error summary at top: aria-live="assertive"
- Success feedback: aria-live="polite"

**Help Text:**
- aria-describedby for help text
- Tooltip content accessible to screen reader

---

#### Touch Target Size

**Minimum Touch Targets (Mobile):**
- Buttons: 44x44px minimum (iOS HIG)
- Icons: 48x48px minimum (Material Design)
- List items: 48px min height
- Spacing: 8px minimum between targets

**Critical Actions:**
- Join Party button: 56px height
- Alert dismiss: 56x56px tap area
- FAB (floating action button): 56x56px

**Rationale:** Motorcycle gloves reduce touch precision. Vibration while riding makes small targets hard. Generous spacing prevents accidental taps.

---

#### Motion & Animation

**Respect User Preferences:**
- Detect prefers-reduced-motion media query
- Disable all non-essential animation if set
- Essential animations (alert pulsing) slowed, simplified

**Animation Guidelines:**
- Keep under 500ms for transitions
- Use CSS transitions (GPU-accelerated)
- Avoid parallax or complex motion
- Alert pulsing: Slow, clear rhythm (not seizure-triggering)

---

#### Testing Strategy

**Automated Testing:**
- Lighthouse CI (in build pipeline)
- axe DevTools (during development)
- Pa11y (automated checks)

**Manual Testing:**
- Keyboard-only navigation through all flows
- Screen reader testing (VoiceOver on iOS, TalkBack on Android)
- Color blindness simulation (Stark plugin)
- Touch target testing on actual devices with gloves

**User Testing:**
- Test with users who have disabilities
- Validate with motorcycle glove wearers
- Test in sunlight (real-world conditions)

---

## 12. Project Vision Summary (Core Decisions)

### What We're Building
A **tactical, intelligent, multiplayer navigation system** for riders who want to outsmart enforcement while staying connected with their crew.

### How It Feels
- **Empowered:** "I'm beating the system"
- **Connected:** "My crew is right there"
- **Confident:** "I've got eyes everywhere"
- **Fun:** That rebellious edge

### Visual Language
**Stealth Mode** - Tactical lime green on pure black. Sharp, under-the-radar, high contrast for visibility. Like night vision goggles meets racing HUD.

### The Innovation
**Context-aware alerts** that adapt from calm banner to full-screen takeover based on actual risk (speed vs limit, distance, braking). No other app does this.

### Core User Flows Mapped
1. ✅ Join/create party with 6-digit code
2. ✅ Live map with party members (≤800ms updates)
3. ✅ Intelligent alert system (3 levels)
4. ⏭️ Next: User journey wireframes, component specifications

---

## Next Steps

This document captures all core UX decisions. The following artifacts remain to create:

1. **Detailed wireframes** for each screen
2. **User journey flowcharts** with decision points
3. **Component specifications** with interaction states
4. **Prototype/mockups** showing design in action
5. **Developer handoff documentation**

Would you like to continue with wireframe generation next, or dive deeper into any specific section?

---

*Document Status: In Progress - Core decisions captured, visual foundation complete, awaiting wireframe phase*
