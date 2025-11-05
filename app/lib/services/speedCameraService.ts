// SpeedLink Speed Camera Service (Epic 5 - Story 5.2)
// Handles speed camera proximity detection and alert triggering

import { createClient } from '@/lib/supabase/client'
import type { SpeedCameraWithDistance, CameraAlert, CameraAlertHistory } from '@/lib/types'

// Alert distance thresholds (meters)
export const ALERT_THRESHOLDS = {
  HIGH: 500,    // 500m - urgent alert
  MEDIUM: 1000, // 1km - warning alert
  LOW: 2000,    // 2km - advance notice
} as const

// Search radius for camera queries (meters)
const SEARCH_RADIUS = 2500 // Slightly larger than LOW threshold for smooth detection

export interface SpeedCameraServiceConfig {
  enableAlerts?: boolean
  alertThresholds?: {
    high?: number
    medium?: number
    low?: number
  }
}

// Distance calculation is handled by database function get_nearby_speed_cameras

/**
 * Check if user heading matches camera direction
 * @param userHeading - User's current heading (0-360 degrees)
 * @param cameraDirection - Camera direction (text or degrees)
 * @returns True if direction matches (user is heading towards camera)
 */
function matchesDirection(
  userHeading: number | null,
  cameraDirection: string | null
): boolean {
  if (!userHeading || !cameraDirection) {
    return true // No direction data, assume match
  }

  // Bidirectional cameras always match
  if (cameraDirection === 'bidirectional') {
    return true
  }

  // Convert cardinal directions to degrees
  const cardinalToHeading: Record<string, number> = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
  }

  let cameraHeading: number
  if (cameraDirection in cardinalToHeading) {
    cameraHeading = cardinalToHeading[cameraDirection]
  } else {
    // Try to parse as number
    const parsed = parseFloat(cameraDirection)
    if (isNaN(parsed)) {
      return true // Can't parse, assume match
    }
    cameraHeading = parsed
  }

  // Check if user is heading in roughly the same direction as camera monitors
  // Allow ±45 degree tolerance
  const diff = Math.abs(userHeading - cameraHeading)
  const normalizedDiff = Math.min(diff, 360 - diff) // Handle wrap-around

  return normalizedDiff <= 45
}

export class SpeedCameraService {
  private supabase = createClient()
  private config: SpeedCameraServiceConfig
  private alertedCameras: Set<string> = new Set() // Track cameras we've already alerted for
  private lastCleanup: number = Date.now()

  constructor(config?: SpeedCameraServiceConfig) {
    this.config = {
      enableAlerts: true,
      alertThresholds: {
        high: ALERT_THRESHOLDS.HIGH,
        medium: ALERT_THRESHOLDS.MEDIUM,
        low: ALERT_THRESHOLDS.LOW,
      },
      ...config,
    }
  }

  /**
   * Fetch all speed cameras within radius of a location
   */
  async getNearbyCameras(
    latitude: number,
    longitude: number,
    radiusMeters: number = SEARCH_RADIUS
  ): Promise<SpeedCameraWithDistance[]> {
    try {
      // Call the database function we created in migration
      const { data, error } = await this.supabase.rpc('get_nearby_speed_cameras', {
        user_lat: latitude,
        user_lng: longitude,
        radius_meters: radiusMeters,
      })

      if (error) {
        console.error('Error fetching nearby cameras:', error)
        return []
      }

      return (data || []) as SpeedCameraWithDistance[]
    } catch (error) {
      console.error('Exception fetching nearby cameras:', error)
      return []
    }
  }

  /**
   * Check for camera alerts at current location
   * @param latitude - Current latitude
   * @param longitude - Current longitude
   * @param heading - Current heading (0-360 degrees, null if unavailable)
   * @returns Array of camera alerts sorted by priority
   */
  async checkForAlerts(
    latitude: number,
    longitude: number,
    heading: number | null = null
  ): Promise<CameraAlert[]> {
    if (!this.config.enableAlerts) {
      return []
    }

    // Clean up old alerted cameras every 5 minutes
    const now = Date.now()
    if (now - this.lastCleanup > 300000) {
      this.alertedCameras.clear()
      this.lastCleanup = now
    }

    // Get nearby cameras
    const cameras = await this.getNearbyCameras(latitude, longitude)

    // Filter and prioritize cameras
    const alerts: CameraAlert[] = cameras
      .filter((camera) => {
        // Skip if already alerted for this camera
        if (this.alertedCameras.has(camera.id)) {
          return false
        }

        // Skip if outside alert threshold
        if (camera.distance_meters > (this.config.alertThresholds?.low || ALERT_THRESHOLDS.LOW)) {
          return false
        }

        return true
      })
      .map((camera) => {
        // Check if user is heading towards camera
        const directionMatch = matchesDirection(heading, camera.direction)

        // Determine priority based on distance
        let priority: 'high' | 'medium' | 'low'
        if (camera.distance_meters <= (this.config.alertThresholds?.high || ALERT_THRESHOLDS.HIGH)) {
          priority = 'high'
        } else if (
          camera.distance_meters <= (this.config.alertThresholds?.medium || ALERT_THRESHOLDS.MEDIUM)
        ) {
          priority = 'medium'
        } else {
          priority = 'low'
        }

        return {
          camera,
          priority,
          direction_match: directionMatch,
          timestamp: now,
        }
      })
      .filter((alert) => {
        // Only alert if direction matches (user is heading towards camera)
        // or if we don't have direction data
        return alert.direction_match || heading === null
      })
      .sort((a, b) => {
        // Sort by distance (closest first)
        return a.camera.distance_meters - b.camera.distance_meters
      })

    return alerts
  }

  /**
   * Mark a camera as alerted to prevent duplicate alerts
   */
  markAsAlerted(cameraId: string): void {
    this.alertedCameras.add(cameraId)
  }

  /**
   * Clear alerted camera (e.g., when user passes the camera)
   */
  clearAlert(cameraId: string): void {
    this.alertedCameras.delete(cameraId)
  }

  /**
   * Clear all alerted cameras
   */
  clearAllAlerts(): void {
    this.alertedCameras.clear()
  }

  /**
   * Save alert to history
   */
  async saveAlertHistory(
    userId: string,
    cameraId: string,
    distanceMeters: number,
    userSpeed: number | null,
    partyId: string | null = null
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('camera_alert_history')
        .insert({
          user_id: userId,
          camera_id: cameraId,
          distance_meters: distanceMeters,
          user_speed: userSpeed,
          party_id: partyId,
        })

      if (error) {
        console.error('Error saving alert history:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception saving alert history:', error)
      return false
    }
  }

  /**
   * Get user's alert history
   */
  async getAlertHistory(
    userId: string,
    limit: number = 50
  ): Promise<(CameraAlertHistory & { camera: unknown })[]> {
    try {
      const { data, error } = await this.supabase
        .from('camera_alert_history')
        .select(`
          *,
          camera:speed_cameras(*)
        `)
        .eq('user_id', userId)
        .order('alerted_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching alert history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Exception fetching alert history:', error)
      return []
    }
  }

  /**
   * Submit feedback on an alert
   */
  async submitFeedback(
    alertId: string,
    wasUseful: boolean,
    feedback?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('camera_alert_history')
        .update({
          was_useful: wasUseful,
          feedback: feedback || null,
        })
        .eq('id', alertId)

      if (error) {
        console.error('Error submitting feedback:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception submitting feedback:', error)
      return false
    }
  }

  /**
   * Report a new speed camera (community feature)
   */
  async reportCamera(
    userId: string,
    camera: {
      latitude: number
      longitude: number
      camera_type: string
      speed_limit: number
      direction?: string
      road_name?: string
      location_description?: string
    }
  ): Promise<{ success: boolean; cameraId?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('speed_cameras')
        .insert({
          ...camera,
          reported_by: userId,
          source: 'community',
          verified: false,
          is_active: true,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error reporting camera:', error)
        return { success: false }
      }

      return { success: true, cameraId: data?.id }
    } catch (error) {
      console.error('Exception reporting camera:', error)
      return { success: false }
    }
  }
}

// Singleton instance
let speedCameraServiceInstance: SpeedCameraService | null = null

export function getSpeedCameraService(config?: SpeedCameraServiceConfig): SpeedCameraService {
  if (!speedCameraServiceInstance) {
    speedCameraServiceInstance = new SpeedCameraService(config)
  }
  return speedCameraServiceInstance
}
