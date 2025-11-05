// Speed Camera Alert History Page (Epic 5 - Story 5.4)
// Displays user's past speed camera encounters

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Clock, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSpeedCameraService } from '@/lib/services/speedCameraService'

interface AlertHistoryItem {
  id: string
  camera_id: string
  distance_meters: number
  user_speed: number | null
  alerted_at: string
  was_useful: boolean | null
  feedback: string | null
  camera: {
    id: string
    latitude: number
    longitude: number
    camera_type: string
    speed_limit: number
    road_name: string | null
    location_description: string | null
  }
}

export default function AlertHistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const cameraService = getSpeedCameraService()

  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<AlertHistoryItem[]>([])
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Fetch alert history
        const historyData = await cameraService.getAlertHistory(user.id, 100)
        setHistory(historyData as AlertHistoryItem[])
      } catch (error) {
        console.error('Error loading alert history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [router, supabase, cameraService])

  const handleFeedback = async (alertId: string, wasUseful: boolean) => {
    setSubmittingFeedback(alertId)
    try {
      const success = await cameraService.submitFeedback(alertId, wasUseful)
      if (success) {
        // Update local state
        setHistory((prev) =>
          prev.map((item) =>
            item.id === alertId ? { ...item, was_useful: wasUseful } : item
          )
        )
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmittingFeedback(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      {/* Header */}
      <header className="bg-[#171717] border-b border-[#262626] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#262626] rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Camera Alert History</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No alerts yet</h2>
            <p className="text-gray-500">
              Your speed camera encounters will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#171717] border border-[#262626] rounded-lg p-4 hover:border-lime-500/30 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Camera icon */}
                  <div className="shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg capitalize">
                          {item.camera.camera_type.replace('_', ' ')} Camera
                        </h3>
                        {item.camera.road_name && (
                          <p className="text-sm text-gray-400">
                            {item.camera.road_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-lime-500">
                          {item.camera.speed_limit}
                        </p>
                        <p className="text-xs text-gray-500">km/h</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatDistance(item.distance_meters)} away</span>
                      </div>
                      {item.user_speed && (
                        <div className="flex items-center gap-1">
                          <span>Your speed: {item.user_speed} km/h</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(item.alerted_at)}</span>
                      </div>
                    </div>

                    {/* Feedback buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(item.id, true)}
                        disabled={submittingFeedback === item.id}
                        className={`p-2 rounded-lg transition ${
                          item.was_useful === true
                            ? 'bg-lime-600 text-white'
                            : 'bg-[#262626] text-gray-400 hover:bg-lime-600/20 hover:text-lime-500'
                        } disabled:opacity-50`}
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(item.id, false)}
                        disabled={submittingFeedback === item.id}
                        className={`p-2 rounded-lg transition ${
                          item.was_useful === false
                            ? 'bg-red-600 text-white'
                            : 'bg-[#262626] text-gray-400 hover:bg-red-600/20 hover:text-red-500'
                        } disabled:opacity-50`}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
