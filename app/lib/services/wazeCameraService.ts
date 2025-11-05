// Waze API Integration for Speed Cameras (Epic 5 Enhancement)
// Fetches real-time community-reported speed cameras from Waze

import { createClient } from '@/lib/supabase/client'

// Waze API endpoints (unofficial - uses publicly available data)
const WAZE_API_BASE = 'https://www.waze.com/row-rtserver/web/TGeoRSS'

interface WazeAlert {
  uuid: string
  location: {
    x: number // longitude
    y: number // latitude
  }
  type: string // 'POLICE' | 'SPEED_CAMERA' | 'ACCIDENT' | 'JAM' | 'WEATHERHAZARD'
  subtype: string
  roadType: number
  speed: number
  reportRating: number
  confidence: number
  reliability: number
  street: string
  reportDescription?: string
  reportBy?: string
  magvar?: number
}

interface WazeBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

/**
 * Fetch Waze alerts for a geographic area
 */
async function fetchWazeAlerts(bounds: WazeBounds): Promise<WazeAlert[]> {
  try {
    const params = new URLSearchParams({
      bottom: bounds.minLat.toString(),
      top: bounds.maxLat.toString(),
      left: bounds.minLon.toString(),
      right: bounds.maxLon.toString(),
      ma: '200', // Max alerts
      mj: '50',  // Max jams
      mu: '50',  // Max users
      types: 'alerts,irregularities',
    })

    const response = await fetch(`${WAZE_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'SpeedLink/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Waze API error: ${response.status}`)
    }

    const data = await response.json()
    return data.alerts || []
  } catch (error) {
    console.error('Error fetching Waze alerts:', error)
    return []
  }
}

/**
 * Convert Waze alert type to our camera type
 */
function mapWazeTypeToCamera(type: string, subtype: string): string | null {
  if (type === 'POLICE') {
    return 'mobile' // Police presence = mobile camera
  }
  
  if (type === 'SPEED_CAMERA') {
    // Waze has specific subtypes for cameras
    if (subtype?.includes('RED_LIGHT')) return 'red_light'
    if (subtype?.includes('MOBILE')) return 'mobile'
    if (subtype?.includes('FIXED')) return 'fixed'
    return 'fixed' // Default
  }

  return null // Not a camera-related alert
}

/**
 * Sync Waze cameras to our database
 */
export async function syncWazeCameras(
  centerLat: number,
  centerLon: number,
  radiusKm: number = 10
): Promise<{ synced: number; errors: number }> {
  const supabase = createClient()

  // Calculate bounding box (approximate)
  const latDelta = radiusKm / 111.32
  const lonDelta = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))

  const bounds: WazeBounds = {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLon: centerLon - lonDelta,
    maxLon: centerLon + lonDelta,
  }

  // Fetch Waze data
  const alerts = await fetchWazeAlerts(bounds)
  
  let synced = 0
  let errors = 0

  for (const alert of alerts) {
    const cameraType = mapWazeTypeToCamera(alert.type, alert.subtype)
    if (!cameraType) continue

    try {
      // Check if camera already exists (by location proximity)
      const { data: existing } = await supabase.rpc('get_nearby_speed_cameras', {
        user_lat: alert.location.y,
        user_lng: alert.location.x,
        radius_meters: 50, // 50m radius to detect duplicates
      })

      if (existing && existing.length > 0) {
        // Camera already exists, skip
        continue
      }

      // Estimate speed limit based on road type (Waze road types)
      const speedLimit = estimateSpeedLimit(alert.roadType, alert.speed)

      // Insert new camera from Waze
      const { error } = await supabase.from('speed_cameras').insert({
        latitude: alert.location.y,
        longitude: alert.location.x,
        camera_type: cameraType,
        speed_limit: speedLimit,
        direction: 'bidirectional', // Waze doesn't provide direction
        road_name: alert.street || 'Unknown Road',
        location_description: `Waze report: ${alert.reportDescription || 'Community reported'}`,
        is_active: true,
        verified: alert.confidence >= 5, // High confidence = verified
        source: 'waze',
        reported_by: null, // No specific user, it's from Waze
      })

      if (error) {
        console.error('Error inserting Waze camera:', error)
        errors++
      } else {
        synced++
      }
    } catch (err) {
      console.error('Error processing Waze alert:', err)
      errors++
    }
  }

  return { synced, errors }
}

/**
 * Estimate speed limit based on Waze road type
 * Waze road types: 1=Street, 2=Primary, 3=Freeway, etc.
 */
function estimateSpeedLimit(roadType: number, reportedSpeed?: number): number {
  // If Waze reports speed, use it (convert from likely mph to km/h)
  if (reportedSpeed && reportedSpeed > 0) {
    // Waze speeds are typically in local units
    // Assume km/h if > 100, otherwise mph
    return reportedSpeed > 100 ? reportedSpeed : Math.round(reportedSpeed * 1.60934)
  }

  // Fallback: estimate by road type
  const speedLimits: Record<number, number> = {
    1: 50,   // Street
    2: 70,   // Primary road
    3: 100,  // Freeway/Highway
    4: 50,   // Ramp
    5: 30,   // Minor street
    6: 110,  // Major highway
    7: 40,   // Off-road
    8: 30,   // Parking lot
    9: 50,   // Private road
    10: 30,  // Bike path
  }

  return speedLimits[roadType] || 50 // Default 50 km/h
}

/**
 * Background sync service - call periodically
 */
export async function startWazeSync(
  intervalMinutes: number = 5,
  userLocation?: { lat: number; lon: number }
): Promise<NodeJS.Timeout | null> {
  if (!userLocation) {
    console.warn('No user location provided for Waze sync')
    return null
  }

  console.log(`Starting Waze sync every ${intervalMinutes} minutes`)

  // Initial sync
  await syncWazeCameras(userLocation.lat, userLocation.lon)

  // Periodic sync
  const interval = setInterval(async () => {
    console.log('Syncing Waze cameras...')
    const result = await syncWazeCameras(userLocation.lat, userLocation.lon)
    console.log(`Waze sync complete: ${result.synced} cameras synced, ${result.errors} errors`)
  }, intervalMinutes * 60 * 1000)

  return interval
}

/**
 * Stop background sync
 */
export function stopWazeSync(interval: NodeJS.Timeout): void {
  clearInterval(interval)
  console.log('Waze sync stopped')
}

/**
 * Manual refresh - call this when user location changes significantly
 */
export async function refreshWazeCameras(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<{ synced: number; errors: number }> {
  console.log(`Refreshing Waze cameras around ${latitude}, ${longitude}`)
  return await syncWazeCameras(latitude, longitude, radiusKm)
}
