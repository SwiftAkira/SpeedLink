# Party Feature - Quick Reference Guide

## For Developers

### Using the Party Context

```tsx
import { useParty } from '@/contexts/PartyContext';

function MyComponent() {
  const {
    currentParty,        // Current party state or null
    isInParty,          // Boolean: user in a party?
    isConnected,        // WebSocket connection status
    isLoading,          // Loading state
    error,              // Error state
    createParty,        // (name?: string) => Promise<void>
    joinParty,          // (code: string) => Promise<void>
    leaveParty,         // () => Promise<void>
    updateLocation,     // (location: LocationData) => void
    sendMessage,        // (message: string) => void
    messages,           // MessageBroadcast[]
    clearError,         // () => void
  } = useParty();

  // Example: Create party
  const handleCreate = async () => {
    await createParty('My Party Name');
  };

  // Example: Join party
  const handleJoin = async () => {
    await joinParty('123456');
  };

  // Example: Send location update
  const handleLocationUpdate = () => {
    updateLocation({
      latitude: 37.7749,
      longitude: -122.4194,
      speed: 25.5,
      heading: 90,
      accuracy: 10
    });
  };
}
```

### Party State Structure

```typescript
interface Party {
  id: number;
  code: string;              // 6-digit party code
  name: string;              // Party name
  leader_id: number;         // User ID of party leader
  members: PartyMember[];    // Array of members
  created_at: string;        // ISO timestamp
  expires_at: string;        // ISO timestamp (24h from creation)
}

interface PartyMember {
  userId: number;
  displayName: string;
  vehicleType: 'motorcycle' | 'car' | 'truck' | 'other';
  isOnline: boolean;
  location?: LocationData;
  joinedAt: string;
  lastSeenAt: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;           // km/h
  heading: number;         // degrees (0-360)
  accuracy: number;        // meters
  timestamp: string;       // ISO timestamp
}
```

### Component Usage

#### Create Party Modal
```tsx
import { CreatePartyModal } from '@/components/party';

<CreatePartyModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
/>
```

#### Join Party Modal
```tsx
import { JoinPartyModal } from '@/components/party';

<JoinPartyModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
/>
```

#### Party Members List
```tsx
import { PartyMembersList } from '@/components/party';

<PartyMembersList
  members={currentParty.members}
  leaderId={currentParty.leader_id}
  currentUserId={user.id}
/>
```

---

## For Users

### Creating a Party

1. Navigate to the Party page
2. Click "Create Party" card
3. (Optional) Enter a party name
4. Click "Create Party" button
5. Share the 6-digit code with friends

### Joining a Party

1. Navigate to the Party page
2. Click "Join Party" card
3. Enter the 6-digit code
4. Click "Join Party" button

### Leaving a Party

1. In the party view, click "Leave Party"
2. Confirm in the dialog
3. You'll be returned to the party selection screen

### Party Code Sharing

- Code is displayed prominently in the party view
- Click "Copy Code" to copy to clipboard
- Share via text, email, or any messaging app

---

## API Reference

### REST Endpoints

#### Create Party
```
POST /party
Authorization: Bearer <token>
Body: { name?: string }
Response: { id, code, name, leader_id, created_at, expires_at }
```

#### Join Party
```
POST /party/join
Authorization: Bearer <token>
Body: { code: string }
Response: { Full party state with members }
```

#### Get Party Details
```
GET /party/:id
Authorization: Bearer <token>
Response: { Full party state }
```

#### Leave Party
```
DELETE /party/:id/leave
Authorization: Bearer <token>
Response: 204 No Content
```

### WebSocket Events

#### Emit (Client → Server)

**Create Party**
```javascript
socket.emit('party:create', { name: 'My Party' });
```

**Join Party**
```javascript
socket.emit('party:join', { code: '123456' });
```

**Leave Party**
```javascript
socket.emit('party:leave', { partyId: 123 });
```

**Update Location**
```javascript
socket.emit('party:update', {
  partyId: 123,
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    speed: 25.5,
    heading: 90,
    accuracy: 10
  }
});
```

**Send Message**
```javascript
socket.emit('party:message', {
  partyId: 123,
  message: 'Traffic ahead!'
});
```

#### Listen (Server → Client)

**Party Created**
```javascript
socket.on('party:created', (party) => {
  console.log('Created:', party.code);
});
```

**Party Joined**
```javascript
socket.on('party:joined', (partyState) => {
  console.log('Joined party:', partyState);
});
```

**Member Joined**
```javascript
socket.on('party:member-joined', ({ userId }) => {
  console.log('New member:', userId);
});
```

**Member Left**
```javascript
socket.on('party:member-left', ({ userId }) => {
  console.log('Member left:', userId);
});
```

**Location Update**
```javascript
socket.on('party:location-update', (location) => {
  console.log('Location update:', location);
});
```

**Message Received**
```javascript
socket.on('party:message-received', (message) => {
  console.log('New message:', message);
});
```

**Error**
```javascript
socket.on('error', (error) => {
  console.error('Party error:', error);
});
```

---

## Troubleshooting

### Common Issues

**"WebSocket not connected"**
- Check that backend is running
- Verify WS_URL environment variable
- Check browser console for connection errors
- Ensure valid JWT token exists

**"Party not found"**
- Verify 6-digit code is correct
- Check party hasn't expired (24h limit)
- Ensure party is still active

**"Party is full"**
- Maximum 20 members per party
- Create a new party if needed

**Location not updating**
- Check browser location permissions
- Verify GPS is enabled on device
- Check network connectivity

### Debug Tips

**Enable verbose logging:**
```javascript
// In PartyContext.tsx
console.log('Party state:', currentParty);
console.log('WebSocket connected:', isConnected);
```

**Check WebSocket connection:**
```javascript
// In browser console
localStorage.getItem('speedlink_auth_token'); // Should exist
```

**Monitor Redis state:**
```bash
redis-cli
> KEYS party:*
> GET party:123:location:456
```

**Check PostgreSQL:**
```sql
SELECT * FROM parties WHERE is_active = true;
SELECT * FROM party_members WHERE party_id = 123;
```

---

## Performance Notes

- Location updates throttled to 1/second max
- Redis caching for real-time state (5min TTL)
- WebSocket room-based routing for efficiency
- Automatic reconnection with exponential backoff
- Optimistic UI updates for better UX

---

## Security Notes

- All endpoints require JWT authentication
- Party access restricted to members only
- Input validation on all requests
- SQL injection prevention via parameterized queries
- XSS protection via React escaping
- Rate limiting on location updates

---

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (iOS 14+)
- ✅ Samsung Internet
- ✅ Mobile browsers (WebSocket support required)

---

## Environment Variables

**Backend:**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
PORT=3000
WS_PORT=3001
```

**Frontend:**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```
