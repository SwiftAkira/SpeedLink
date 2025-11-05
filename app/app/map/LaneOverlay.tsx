'use client'

import { Layer, Source } from 'react-map-gl/mapbox'
import type { LaneInfo } from '@/lib/types'

interface LaneOverlayProps {
  lanes: LaneInfo[]
  position: [number, number] // lng, lat
  heading: number // direction in degrees
}

export default function LaneOverlay({ lanes, position, heading }: LaneOverlayProps) {
  if (!lanes || lanes.length === 0) {
    return null
  }

  const [lng, lat] = position
  const laneWidth = 0.00003 // degrees (about 3 meters)
  const laneLength = 0.0008 // degrees (about 80 meters ahead)
  
  // Calculate offset perpendicular to heading
  const headingRad = (heading * Math.PI) / 180
  const perpRad = headingRad + Math.PI / 2

  // Center offset
  const totalWidth = lanes.length * laneWidth
  const startOffset = -totalWidth / 2

  const laneFeatures = lanes.map((lane, index) => {
    const laneOffset = startOffset + (index + 0.5) * laneWidth
    
    // Calculate lane center position
    const centerLng = lng + laneOffset * Math.cos(perpRad)
    const centerLat = lat + laneOffset * Math.sin(perpRad)
    
    // Calculate start and end points along heading direction
    const startLng = centerLng
    const startLat = centerLat
    const endLng = centerLng + laneLength * Math.sin(headingRad)
    const endLat = centerLat + laneLength * Math.cos(headingRad)
    
    // Create lane stripe
    return {
      type: 'Feature' as const,
      properties: {
        valid: lane.valid,
        active: lane.active,
        indications: lane.indications.join(','),
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [[startLng, startLat], [endLng, endLat]],
      },
    }
  })

  const geojson = {
    type: 'FeatureCollection' as const,
    features: laneFeatures,
  }

  return (
    <>
      {/* Active/Valid lanes - bright */}
      <Source id="active-lanes" type="geojson" data={geojson}>
        <Layer
          id="active-lanes-layer"
          type="line"
          paint={{
            'line-color': [
              'case',
              ['get', 'active'],
              '#84CC16', // Active lane - lime green
              ['get', 'valid'],
              '#FAFAFA', // Valid lane - white
              '#525252', // Invalid lane - gray
            ],
            'line-width': 8,
            'line-opacity': [
              'case',
              ['get', 'active'],
              0.9,
              ['get', 'valid'],
              0.7,
              0.3,
            ],
          }}
        />
      </Source>

      {/* Lane arrows */}
      <Source id="lane-arrows" type="geojson" data={geojson}>
        <Layer
          id="lane-arrows-layer"
          type="symbol"
          layout={{
            'symbol-placement': 'line',
            'symbol-spacing': 50,
            'icon-image': 'arrow', // Mapbox built-in arrow icon
            'icon-size': [
              'case',
              ['get', 'active'],
              1.2,
              ['get', 'valid'],
              1.0,
              0.7,
            ],
            'icon-rotate': heading,
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
          }}
          paint={{
            'icon-opacity': [
              'case',
              ['get', 'active'],
              1.0,
              ['get', 'valid'],
              0.8,
              0.4,
            ],
            'icon-color': [
              'case',
              ['get', 'active'],
              '#84CC16',
              ['get', 'valid'],
              '#FAFAFA',
              '#525252',
            ],
          }}
        />
      </Source>
    </>
  )
}
