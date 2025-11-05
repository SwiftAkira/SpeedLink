// SpeedLink Speed Camera Alert Component (Epic 5 - Story 5.3)
// Visual and audio alerts for speed cameras

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Camera, Bell } from 'lucide-react'
import type { CameraAlert } from '@/lib/types'

interface SpeedCameraAlertProps {
  alerts: CameraAlert[]
  onDismiss?: (cameraId: string) => void
  enableAudio?: boolean
}

// Audio alert frequencies and patterns
const AUDIO_CONFIG = {
  high: { frequency: 1200, duration: 400, pattern: [200, 100, 200] }, // Urgent beeps
  medium: { frequency: 800, duration: 300, pattern: [250, 150] }, // Warning beeps
  low: { frequency: 600, duration: 200, pattern: [300] }, // Single beep
}

export default function SpeedCameraAlert({
  alerts,
  onDismiss,
  enableAudio = true,
}: SpeedCameraAlertProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const alertedIdsRef = useRef<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Initialize audio context
  useEffect(() => {
    if (enableAudio && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [enableAudio])

  // Play audio alert
  const playAlert = useCallback((priority: 'high' | 'medium' | 'low') => {
    if (!enableAudio || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const config = AUDIO_CONFIG[priority]
    let startTime = ctx.currentTime

    config.pattern.forEach((duration, index) => {
      if (index % 2 === 0) {
        // Play beep
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = config.frequency
        oscillator.type = 'sine'

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration / 1000)
      }
      startTime += duration / 1000
    })
  }, [enableAudio])

  // Handle new alerts
  useEffect(() => {
    alerts.forEach((alert) => {
      if (!alertedIdsRef.current.has(alert.camera.id) && !dismissed.has(alert.camera.id)) {
        alertedIdsRef.current.add(alert.camera.id)
        playAlert(alert.priority)

        // Vibrate if supported
        if ('vibrate' in navigator) {
          if (alert.priority === 'high') {
            navigator.vibrate([200, 100, 200])
          } else if (alert.priority === 'medium') {
            navigator.vibrate([150, 100, 150])
          } else {
            navigator.vibrate(100)
          }
        }
      }
    })
  }, [alerts, dismissed, playAlert])

  const handleDismiss = (cameraId: string) => {
    setDismissed((prev) => new Set(prev).add(cameraId))
    onDismiss?.(cameraId)
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.camera.id))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 space-y-2">
      {visibleAlerts.map((alert) => {
        const camera = alert.camera
        const distanceKm = (camera.distance_meters / 1000).toFixed(1)
        const distanceM = camera.distance_meters

        // Determine styling based on priority
        const priorityStyles = {
          high: 'bg-red-600 border-red-500 animate-pulse',
          medium: 'bg-amber-600 border-amber-500',
          low: 'bg-lime-700 border-lime-600',
        }

        const iconComponent =
          alert.priority === 'high' ? (
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          ) : (
            <Camera className="w-6 h-6" />
          )

        return (
          <div
            key={camera.id}
            className={`${priorityStyles[alert.priority]} border-2 rounded-lg shadow-2xl p-4 text-white`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">{iconComponent}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg uppercase tracking-wide">
                    {alert.priority === 'high' ? '⚠️ SPEED CAMERA AHEAD' : 'Speed Camera'}
                  </h3>
                  {enableAudio && (
                    <Bell className="w-4 h-4 opacity-75" />
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-xl">
                    {distanceM < 1000 ? `${distanceM}m` : `${distanceKm}km`}
                  </p>

                  <div className="flex items-center gap-2 opacity-90">
                    <span className="font-medium">{camera.speed_limit} km/h</span>
                    <span className="opacity-75">•</span>
                    <span className="capitalize">{camera.camera_type.replace('_', ' ')}</span>
                  </div>

                  {camera.road_name && (
                    <p className="text-xs opacity-75">{camera.road_name}</p>
                  )}

                  {camera.direction && camera.direction !== 'bidirectional' && (
                    <p className="text-xs opacity-75">Direction: {camera.direction}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDismiss(camera.id)}
                className="shrink-0 text-white/70 hover:text-white text-2xl font-bold leading-none"
                aria-label="Dismiss alert"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
