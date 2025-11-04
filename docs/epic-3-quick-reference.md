# Epic 3: Party Features - Quick Reference

## 🚀 Getting Started

### 1. Run the Database Migration
```bash
# Copy the contents of app/supabase-party-migration.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

### 2. Start Development Server
```bash
cd app
npm run dev
```

### 3. Navigate to Party Page
```
http://localhost:3000/party
```

## 📋 Key Features Implemented

### Create Party
- Generates unique 6-digit code (e.g., "847362")
- Optional party name
- Creator auto-joins as first member
- Party code displayed with copy button

### Join Party
- Enter 6-digit code
- Real-time validation
- Error handling for invalid/inactive parties
- Prevents duplicate memberships

### Party Member List
- Real-time member updates
- Online/offline status indicators
- Display member speed and last seen time
- Avatar placeholders with initials

### Leave Party
- Confirmation dialog to prevent accidents
- Auto-deactivates party when last member leaves
- Clean removal from party_members table

## 🗂️ Project Structure

```
app/
├── lib/
│   ├── types.ts                       # TypeScript types
│   └── services/
│       └── partyService.ts            # Party logic
├── app/
│   └── party/
│       ├── page.tsx                   # Main party page
│       ├── CreatePartyModal.tsx       # Create party UI
│       ├── JoinPartyModal.tsx         # Join party UI
│       └── PartyMemberList.tsx        # Member list UI
└── supabase-party-migration.sql       # Database schema
```

## 🎨 Design System Colors

```css
--primary: #84CC16        /* Lime Green */
--secondary: #FBBF24      /* Amber */
--accent: #F97316         /* Orange */
--success: #22C55E        /* Green */
--warning: #EAB308        /* Yellow */
--danger: #DC2626         /* Red */
--background: #0C0C0C     /* Near Black */
--card-bg: #171717        /* Dark Gray */
--foreground: #FAFAFA     /* Off White */
```

## 📊 Database Schema

### parties
- `id` - UUID primary key
- `party_code` - TEXT (6 digits, unique)
- `name` - TEXT (optional)
- `created_by` - UUID (references profiles)
- `is_active` - BOOLEAN
- `created_at`, `updated_at` - TIMESTAMPTZ

### party_members
- `id` - UUID primary key
- `party_id` - UUID (references parties)
- `user_id` - UUID (references profiles)
- `joined_at`, `last_seen_at` - TIMESTAMPTZ
- `is_online` - BOOLEAN

### location_updates
- `id` - UUID primary key
- `user_id`, `party_id` - UUID references
- `latitude`, `longitude` - DOUBLE PRECISION
- `speed`, `heading` - DOUBLE PRECISION
- `accuracy` - DOUBLE PRECISION
- `created_at` - TIMESTAMPTZ

## 🔧 Service Functions

```typescript
// Party Management
createParty({ name?: string })
joinParty({ party_code: string })
leaveParty(partyId: string)
getCurrentParty()

// Location & Members
getPartyMembersWithLocations(partyId: string)
updateLocation(partyId: string, input: LocationInput)

// Real-time Subscriptions
subscribeToPartyMembers(partyId, callback)
subscribeToLocationUpdates(partyId, callback)
```

## 🧪 Testing Scenarios

### Test 1: Create Party
1. Go to /party
2. Click "Create Party"
3. Enter optional name
4. Verify 6-digit code is generated
5. Verify you appear in member list

### Test 2: Join Party
1. Open incognito window
2. Login with different account
3. Go to /party
4. Click "Join Party"
5. Enter party code from Test 1
6. Verify you join successfully

### Test 3: Real-time Updates
1. Keep both windows from Tests 1-2 open
2. Verify second user appears in first user's member list
3. Verify real-time updates work (within 1-2 seconds)

### Test 4: Leave Party
1. In one window, click "Leave"
2. Confirm in dialog
3. Verify user removed from other window's member list
4. Verify party still active (one member remains)

### Test 5: Copy Party Code
1. Click "Copy" button next to party code
2. Paste in another app
3. Verify 6-digit code copied correctly

## 🔒 Security Features

- ✅ Row Level Security on all tables
- ✅ Users can only see their party's data
- ✅ Authentication required for all operations
- ✅ Party codes are random and unpredictable
- ✅ No ability to enumerate or view arbitrary parties

## 📱 Mobile Optimizations

- ✅ 48px minimum touch targets
- ✅ Numeric keyboard for code input
- ✅ Large, readable fonts
- ✅ High contrast colors
- ✅ Responsive layouts
- ✅ Mobile-first design

## 🐛 Common Issues

### "Party not found"
- Code may be invalid or party deactivated
- Check that code is exactly 6 digits
- Verify party hasn't been deleted

### "Already a member"
- User is already in this party
- Close and reopen page to see current party

### Real-time updates not working
- Check Supabase connection
- Verify policies are set correctly
- Check browser console for errors

## 📈 Performance Notes

- Indexed foreign keys for fast lookups
- Location updates use efficient INSERT pattern
- Real-time subscriptions filtered by party_id
- Member list refreshes only on relevant changes

## 🎯 Next Steps (Epic 4)

With party features complete:
1. Integrate Mapbox GL JS
2. Display party members on map
3. Add real-time location tracking
4. Show speed and heading indicators
5. Add speed camera alert overlays

## 📚 Documentation

- `/docs/epic-3-implementation-summary.md` - Detailed implementation notes
- `/docs/epic-3-migration-instructions.md` - How to run migration
- `/app/supabase-party-migration.sql` - Database schema
