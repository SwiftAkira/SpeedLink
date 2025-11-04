// SpeedLink Location Service
// Handles geolocation tracking with battery optimization

import { createClient } from '@/lib/supabase/client'
import type { LocationUpdate } from '@/lib/types'

export interface LocationCoordinates {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
}

export interface LocationServiceConfig {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  updateInterval?: number
}

const DEFAULT_CONFIG: LocationServiceConfig = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
  updateInterval: 3000, // 3 seconds for <800ms latency target
}

export class LocationService {
  private watchId: number | null = null
  private updateTimer: NodeJS.Timeout | null = null
  private lastPosition: LocationCoordinates | null = null
  private config: LocationServiceConfig
  private onUpdate: ((position: LocationCoordinates) => void) | null = null
  private onError: ((error: GeolocationPositionError) => void) | null = null

  constructor(config?: Partial<LocationServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if geolocation is supported by the browser
   */
  static isSupported(): boolean {
    return 'geolocation' in navigator
  }

  /**
   * Request location permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!LocationService.isSupported()) {
      return false
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state === 'granted' || result.state === 'prompt'
    } catch (error) {
      console.error('Permission query failed:', error)
      return true // Fallback: try anyway
    }
  }

  /**
   * Start watching user location
   */
  startTracking(
    onUpdate: (position: LocationCoordinates) => void,
    onError?: (error: GeolocationPositionError) => void
  ): void {
    if (!LocationService.isSupported()) {
      console.error('Geolocation not supported')
      return
    }

    this.onUpdate = onUpdate
    this.onError = onError || null

    const options: PositionOptions = {
      enableHighAccuracy: this.config.enableHighAccuracy,
      timeout: this.config.timeout,
      maximumAge: this.config.maximumAge,
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      options
    )
  }

  /**
   * Stop watching user location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    if (this.updateTimer !== null) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }

    this.lastPosition = null
  }

  /**
   * Get current position once
   */
  getCurrentPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!LocationService.isSupported()) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition = this.parsePosition(position)
          resolve(geoPosition)
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
        }
      )
    })
  }

  /**
   * Save location to Supabase for a specific party
   */
  async saveLocation(
    partyId: string,
    position: LocationCoordinates
  ): Promise<LocationUpdate | null> {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('location_updates')
        .insert({
          user_id: user.id,
          party_id: partyId,
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed ? position.speed * 3.6 : 0, // Convert m/s to km/h
          heading: position.heading || 0,
          accuracy: position.accuracy,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to save location:', error)
      return null
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  /**
   * Private: Handle position update from geolocation API
   */
  private handlePositionUpdate(position: GeolocationPosition): void {
    const geoPosition = this.parsePosition(position)
    this.lastPosition = geoPosition

    if (this.onUpdate) {
      this.onUpdate(geoPosition)
    }
  }

  /**
   * Private: Handle geolocation errors
   */
  private handlePositionError(error: GeolocationPositionError): void {
    console.error('Geolocation error:', error.message)
    
    if (this.onError) {
      this.onError(error)
    }
  }

  /**
   * Private: Parse browser GeolocationPosition to our format
   */
  private parsePosition(position: GeolocationPosition): LocationCoordinates {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
    }
  }

  /**
   * Get last known position
   */
  getLastPosition(): LocationCoordinates | null {
    return this.lastPosition
  }
}

// Singleton instance for app-wide use
let locationServiceInstance: LocationService | null = null

export function getLocationService(
  config?: Partial<LocationServiceConfig>
): LocationService {
  if (!locationServiceInstance) {
    locationServiceInstance = new LocationService(config)
  }
  return locationServiceInstance
}
