# Party Features

Party management system for SpeedLink - create, join, and manage riding groups.

## Quick Start

### 1. Setup Database
```bash
# Run in Supabase SQL Editor
cat app/supabase-party-migration.sql
```

### 2. Start App
```bash
cd app
npm run dev
```

### 3. Navigate to Party Page
```
http://localhost:3000/party
```

## Features

### Create Party
- Generate unique 6-digit code
- Optional party name
- Automatic membership
- Share code with friends

### Join Party
- Enter 6-digit code
- Instant validation
- Error feedback
- No duplicates allowed

### Party Members
- Real-time member list
- Online/offline status
- Speed display
- Last seen time

### Leave Party
- Confirmation required
- Clean exit
- Party cleanup

## Components

```
party/
├── page.tsx              # Main party page
├── CreatePartyModal.tsx  # Create party UI
├── JoinPartyModal.tsx    # Join party UI
└── PartyMemberList.tsx   # Member list
```

## Service API

```typescript
// Create party
const { data, error } = await createParty({ 
  name: 'Friday Night Ride' 
});

// Join party
const { data, error } = await joinParty({ 
  party_code: '847362' 
});

// Get current party
const { data, error } = await getCurrentParty();

// Leave party
const { data, error } = await leaveParty(partyId);

// Real-time updates
const channel = subscribeToPartyMembers(partyId, (payload) => {
  console.log('Member update:', payload);
});
```

## Database Schema

### parties
- id, party_code (6-digit)
- name (optional)
- created_by, is_active

### party_members
- id, party_id, user_id
- joined_at, last_seen_at
- is_online

### location_updates
- id, user_id, party_id
- latitude, longitude
- speed, heading, accuracy

## Security

- Row Level Security enabled
- Users see only their party
- Authentication required
- Random party codes

## Testing

```bash
# Test create party
1. Login
2. Go to /party
3. Click "Create Party"
4. Verify code generated

# Test join party
1. Open incognito window
2. Login with different account
3. Enter party code
4. Verify join successful

# Test real-time
1. Keep both windows open
2. Verify member appears in list
3. Check updates within 1-2 seconds
```

## Troubleshooting

### "Party not found"
- Check code is exactly 6 digits
- Verify party is still active
- Try refreshing the page

### Real-time not working
- Check Supabase connection
- Verify RLS policies set
- Check browser console for errors

### "Already a member"
- User is already in this party
- Refresh to see current party

## Documentation

- [Implementation Summary](../docs/epic-3-implementation-summary.md)
- [Migration Guide](../docs/epic-3-migration-instructions.md)
- [Quick Reference](../docs/epic-3-quick-reference.md)
