// Speed Camera Map Marker Component (Epic 5 - Story 5.3)
// Displays speed camera icons on the map

'use client'

import { Marker } from 'react-map-gl/mapbox'
import { Camera } from 'lucide-react'
import type { SpeedCameraWithDistance } from '@/lib/types'

interface SpeedCameraMarkerProps {
  camera: SpeedCameraWithDistance
  onClick?: (camera: SpeedCameraWithDistance) => void
}

export default function SpeedCameraMarker({ camera, onClick }: SpeedCameraMarkerProps) {
  // Determine marker color based on camera type
  const getMarkerColor = () => {
    switch (camera.camera_type) {
      case 'fixed':
        return '#DC2626' // Red
      case 'mobile':
        return '#F97316' // Orange
      case 'red_light':
        return '#EAB308' // Yellow
      case 'average_speed':
        return '#84CC16' // Lime
      case 'section':
        return '#22C55E' // Green
      default:
        return '#DC2626'
    }
  }

  const markerColor = getMarkerColor()

  return (
    <Marker
      longitude={camera.longitude}
      latitude={camera.latitude}
      anchor="center"
      onClick={(e) => {
        e.originalEvent?.stopPropagation()
        onClick?.(camera)
      }}
    >
      <div
        className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{
          width: '32px',
          height: '32px',
        }}
      >
        {/* Pulsing ring for high priority */}
        {camera.distance_meters < 500 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{
              backgroundColor: markerColor,
            }}
          />
        )}

        {/* Camera icon background */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: markerColor,
          }}
        >
          <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>

        {/* Speed limit badge */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap"
          style={{ fontSize: '10px' }}
        >
          {camera.speed_limit}
        </div>
      </div>
    </Marker>
  )
}
