'use client'

import { useEffect, useRef, useMemo } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface MarkerData {
  id: string
  latitude: number
  longitude: number
  displayName?: string
  speed?: number
  heading?: number
  isCurrentUser?: boolean
}

interface MapViewProps {
  markers?: MarkerData[]
  center?: [number, number]
  zoom?: number
  onLocationUpdate?: (latitude: number, longitude: number) => void
  className?: string
}

interface GeolocateEvent {
  coords: {
    latitude: number
    longitude: number
    accuracy: number
    altitude: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  }
}

export default function MapView({
  markers = [],
  center,
  zoom = 13,
  onLocationUpdate,
  className = ''
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const mapError = !mapboxToken ? 'Mapbox token not configured' : null

  const initialViewState = useMemo(() => ({
    longitude: center?.[0] || -0.1276,
    latitude: center?.[1] || 51.5074,
    zoom: zoom,
  }), [center, zoom])

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({
        center: [center[0], center[1]],
        duration: 1000
      })
    }
  }, [center])

  const handleGeolocate = (e: GeolocateEvent) => {
    if (e.coords && onLocationUpdate) {
      onLocationUpdate(e.coords.latitude, e.coords.longitude)
    }
  }

  if (mapError) {
    return (
      <div className={`flex items-center justify-center bg-[#171717] rounded-xl border border-[#262626] ${className}`}>
        <div className="text-center p-8">
          <p className="text-[#DC2626] font-bold mb-2">Map Error</p>
          <p className="text-[#A3A3A3] text-sm">{mapError}</p>
        </div>
      </div>
    )
  }

  if (!mapboxToken) {
    return (
      <div className={`flex items-center justify-center bg-[#171717] rounded-xl border border-[#262626] ${className}`}>
        <div className="text-center p-8">
          <p className="text-[#FBBF24] font-bold mb-2">Map Loading...</p>
          <p className="text-[#A3A3A3] text-sm">Initializing map service</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[#262626] ${className}`}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        
        {/* Geolocate Control */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          onGeolocate={handleGeolocate}
          style={{
            backgroundColor: '#171717',
            borderColor: '#262626',
          }}
        />

        {/* Party Member Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
          >
            <div className="relative">
              {/* Speed indicator above marker */}
              {marker.speed !== undefined && marker.speed > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0C0C0C] border border-[#84CC16] rounded px-2 py-1 text-xs font-bold text-[#84CC16] whitespace-nowrap">
                  {Math.round(marker.speed)} km/h
                </div>
              )}
              
              {/* Marker pin */}
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${
                  marker.isCurrentUser
                    ? 'bg-[#84CC16] border-[#65A30D]'
                    : 'bg-[#FBBF24] border-[#D97706]'
                }`}
                style={
                  marker.heading !== undefined
                    ? { transform: `rotate(${marker.heading}deg)` }
                    : undefined
                }
              >
                {marker.isCurrentUser ? (
                  <div className="w-3 h-3 bg-[#0C0C0C] rounded-full" />
                ) : (
                  <div className="w-3 h-3 bg-[#171717] rounded-full" />
                )}
              </div>

              {/* Display name below marker */}
              {marker.displayName && (
                <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-[#0C0C0C]/90 border border-[#262626] rounded px-2 py-1 text-xs font-semibold text-[#FAFAFA] whitespace-nowrap">
                  {marker.displayName}
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Speed legend - bottom left */}
      {markers.some(m => m.speed !== undefined) && (
        <div className="absolute bottom-4 left-4 bg-[#0C0C0C]/90 border border-[#262626] rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#84CC16] rounded-full" />
            <span className="text-[#FAFAFA] font-semibold">You</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-2">
            <div className="w-3 h-3 bg-[#FBBF24] rounded-full" />
            <span className="text-[#FAFAFA] font-semibold">Party</span>
          </div>
        </div>
      )}
    </div>
  )
}
