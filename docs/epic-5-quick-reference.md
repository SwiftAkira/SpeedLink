# Epic 5: Speed Camera Alerts - Quick Reference

## 🚀 Quick Start

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run:
app/speed-camera-migration.sql
```

### 2. Add Real Camera Data
```sql
-- Replace sample data with your region's cameras
INSERT INTO public.speed_cameras (
  latitude, longitude, camera_type, speed_limit, 
  direction, road_name, is_active, verified
) VALUES
  (51.5074, -0.1278, 'fixed', 50, 'N', 'A40 Westway', true, true);
```

### 3. Test on Map
- Navigate to `/map`
- Grant location permissions
- Move around to trigger alerts
- Visit `/cameras` to view history

---

## 📊 Alert Priorities

| Priority | Distance | Color | Sound | Use Case |
|----------|----------|-------|-------|----------|
| **High** | 500m | Red | 1200Hz triple beep | Urgent - slow down NOW |
| **Medium** | 1km | Amber | 800Hz double beep | Warning - check speed |
| **Low** | 2km | Lime | 600Hz single beep | Info - awareness |

---

## 🎨 Component Usage

### SpeedCameraAlert
```tsx
import SpeedCameraAlert from '@/app/map/SpeedCameraAlert'

<SpeedCameraAlert
  alerts={cameraAlerts}
  onDismiss={(cameraId) => handleDismiss(cameraId)}
  enableAudio={true}
/>
```

### SpeedCameraMarker (MapView)
```tsx
<MapView
  speedCameras={nearbyCameras}
  onCameraClick={(camera) => setSelectedCamera(camera)}
  // ... other props
/>
```

---

## 🛠️ Service API

### getSpeedCameraService()

```typescript
import { getSpeedCameraService } from '@/lib/services/speedCameraService'

const cameraService = getSpeedCameraService()

// Check for alerts
const alerts = await cameraService.checkForAlerts(
  latitude, 
  longitude, 
  heading // optional
)

// Get nearby cameras (for map)
const cameras = await cameraService.getNearbyCameras(
  latitude, 
  longitude, 
  radiusMeters // default 2500
)

// Save alert history
await cameraService.saveAlertHistory(
  userId,
  cameraId,
  distanceMeters,
  userSpeed,
  partyId // optional
)

// Mark as alerted (prevent duplicates)
cameraService.markAsAlerted(cameraId)

// Clear specific alert
cameraService.clearAlert(cameraId)

// Get user's history
const history = await cameraService.getAlertHistory(userId, limit)

// Submit feedback
await cameraService.submitFeedback(alertId, wasUseful, feedback)

// Report new camera (community)
await cameraService.reportCamera(userId, {
  latitude,
  longitude,
  camera_type: 'fixed',
  speed_limit: 50,
  direction: 'N',
  road_name: 'Main St'
})
```

---

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/map` | Main map with real-time camera detection |
| `/cameras` | Alert history and feedback |

---

## 🗄️ Database Schema

### speed_cameras
```sql
- id (uuid, PK)
- latitude, longitude (numeric)
- camera_type (fixed|mobile|red_light|average_speed|section)
- speed_limit (integer, km/h)
- direction (text, e.g., 'N', 'bidirectional')
- road_name (text)
- location_description (text)
- is_active (boolean)
- verified (boolean)
- source (text, 'official'|'community')
- reported_by (uuid, FK to auth.users)
- created_at, updated_at, verified_at (timestamptz)
```

### camera_alert_history
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- camera_id (uuid, FK to speed_cameras)
- party_id (uuid, FK to parties, optional)
- distance_meters (integer)
- user_speed (integer, km/h, optional)
- alerted_at (timestamptz)
- was_useful (boolean, optional)
- feedback (text, optional)
```

---

## 🎯 Camera Types

| Type | Icon Color | Description |
|------|-----------|-------------|
| `fixed` | Red | Permanent roadside camera |
| `mobile` | Orange | Temporary/mobile camera |
| `red_light` | Yellow | Traffic light camera |
| `average_speed` | Lime | Section speed check |
| `section` | Green | Long-distance average speed |

---

## ⚡ Performance Tips

1. **Database Indexing**
   - Already optimized with lat/lng indexes
   - Query completes in <50ms

2. **Client-Side Caching**
   - Service tracks alerted cameras
   - Auto-cleanup every 5 minutes

3. **Efficient Queries**
   - Only fetches cameras within 2.5km
   - Uses rectangular bounding box filter

4. **Audio Optimization**
   - Web Audio API (zero latency)
   - Oscillator nodes with auto-cleanup

5. **React Performance**
   - useCallback for audio playback
   - Memoized alert components

---

## 🔧 Configuration

### Alert Thresholds
```typescript
// In speedCameraService.ts
export const ALERT_THRESHOLDS = {
  HIGH: 500,    // 500m
  MEDIUM: 1000, // 1km
  LOW: 2000,    // 2km
}
```

### Audio Settings
```typescript
// In SpeedCameraAlert.tsx
const AUDIO_CONFIG = {
  high: { frequency: 1200, duration: 400, pattern: [200, 100, 200] },
  medium: { frequency: 800, duration: 300, pattern: [250, 150] },
  low: { frequency: 600, duration: 200, pattern: [300] },
}
```

---

## 🐛 Debugging

### Check Camera Detection
```typescript
// In browser console (map page)
const service = getSpeedCameraService()
const cameras = await service.getNearbyCameras(51.5074, -0.1278, 5000)
console.log(cameras)
```

### Test Audio
```typescript
// In SpeedCameraAlert component
// Trigger manually
playAlert('high') // or 'medium', 'low'
```

### Verify Database
```sql
-- Check cameras exist
SELECT COUNT(*) FROM speed_cameras WHERE is_active = true;

-- View nearby cameras
SELECT * FROM get_nearby_speed_cameras(51.5074, -0.1278, 2000);

-- Check alert history
SELECT * FROM camera_alert_history WHERE user_id = 'your-user-id';
```

---

## 📝 TypeScript Types

```typescript
import type {
  SpeedCamera,
  SpeedCameraWithDistance,
  CameraAlert,
  CameraAlertHistory,
  CameraType,
} from '@/lib/types'

// Camera with distance
interface SpeedCameraWithDistance extends SpeedCamera {
  distance_meters: number
}

// Alert with priority
interface CameraAlert {
  camera: SpeedCameraWithDistance
  priority: 'high' | 'medium' | 'low'
  direction_match: boolean
  timestamp: number
}
```

---

## ✅ Checklist for New Cameras

- [ ] Accurate latitude/longitude (use Google Maps)
- [ ] Correct camera type (fixed/mobile/etc)
- [ ] Speed limit in km/h
- [ ] Direction (N/S/E/W or bidirectional)
- [ ] Road name for user clarity
- [ ] Mark as verified if official source
- [ ] Set is_active = true
- [ ] Add location_description for context

---

## 🎨 UI Customization

### Alert Banner Colors
```typescript
// In SpeedCameraAlert.tsx
const priorityStyles = {
  high: 'bg-red-600 border-red-500 animate-pulse',
  medium: 'bg-amber-600 border-amber-500',
  low: 'bg-lime-700 border-lime-600',
}
```

### Map Marker Colors
```typescript
// In SpeedCameraMarker.tsx
const getMarkerColor = (type: CameraType) => {
  switch (type) {
    case 'fixed': return '#DC2626'    // Red
    case 'mobile': return '#F97316'   // Orange
    case 'red_light': return '#EAB308' // Yellow
    case 'average_speed': return '#84CC16' // Lime
    case 'section': return '#22C55E'  // Green
  }
}
```

---

## 🔗 Related Files

- `app/speed-camera-migration.sql` - Database setup
- `app/lib/services/speedCameraService.ts` - Core logic
- `app/lib/types.ts` - TypeScript definitions
- `app/app/map/SpeedCameraAlert.tsx` - Alert UI
- `app/app/map/SpeedCameraMarker.tsx` - Map marker
- `app/app/cameras/page.tsx` - History page
- `docs/epic-5-implementation-summary.md` - Full docs

---

**Need help?** Check the full implementation summary or review the code comments.
