'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getLocationService, type LocationCoordinates } from '@/lib/services/locationService'
import MapView, { type MarkerData } from './MapView'
import type { PartyMember, Profile, LocationUpdate } from '@/lib/types'

interface PartyMemberWithProfile extends PartyMember {
  profile: Profile
  location?: LocationUpdate
}

export default function MapPage() {
  const router = useRouter()
  const supabase = createClient()
  const locationService = getLocationService()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [userPartyId, setUserPartyId] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>()
  const [partyMembers, setPartyMembers] = useState<PartyMemberWithProfile[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize - check auth and get user's party
  useEffect(() => {
    async function initialize() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        // Get user's active party
        const { data: membership } = await supabase
          .from('party_members')
          .select('party_id, party:parties!inner(is_active)')
          .eq('user_id', user.id)
          .eq('party.is_active', true)
          .maybeSingle()

        let activePartyId: string | null = null
        if (membership) {
          activePartyId = membership.party_id
          setUserPartyId(activePartyId)
          setNotice(null)
        } else {
          setUserPartyId(null)
          setNotice('You are not currently in an active party. Your location stays private until you join or create one.')
        }

        // Request location permission
        const hasPermission = await locationService.requestPermission()
        if (!hasPermission) {
          setError('Location permission is required to use the map.')
          setLoading(false)
          return
        }

        // Get initial position
        try {
          const position = await locationService.getCurrentPosition()
          setCurrentLocation([position.longitude, position.latitude])
          if (activePartyId) {
            await locationService.saveLocation(activePartyId, position)
          }
        } catch (err) {
          console.error('Failed to get initial position:', err)
        }

        setLoading(false)
      } catch (err) {
        console.error('Initialization error:', err)
        setError('Failed to initialize map')
        setLoading(false)
      }
    }

    initialize()
  }, [router, supabase, locationService])

  // Start location tracking
  useEffect(() => {
    const handleLocationUpdate = (position: LocationCoordinates) => {
      setCurrentLocation([position.longitude, position.latitude])
      if (userPartyId) {
        void locationService.saveLocation(userPartyId, position)
      }
    }

    const handleLocationError = (err: GeolocationPositionError) => {
      console.error('Location tracking error:', err.message)
    }

    locationService.startTracking(handleLocationUpdate, handleLocationError)

    return () => {
      locationService.stopTracking()
    }
  }, [userPartyId, locationService])

  // Fetch party members with their profiles
  const fetchPartyMembers = useCallback(async () => {
    if (!userPartyId) return

    try {
      const { data, error: fetchError } = await supabase
        .from('party_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('party_id', userPartyId)

      if (fetchError) throw fetchError

      setPartyMembers(data || [])
    } catch (err) {
      console.error('Failed to fetch party members:', err)
    }
  }, [userPartyId, supabase])

  // Subscribe to location updates
  useEffect(() => {
    if (!userPartyId) return

    fetchPartyMembers()

    // Subscribe to location_updates table
    const locationChannel = supabase
      .channel(`location_updates:${userPartyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_updates',
          filter: `party_id=eq.${userPartyId}`,
        },
        (payload) => {
          const newLocation = payload.new as LocationUpdate
          
          setPartyMembers((prev) =>
            prev.map((member) =>
              member.user_id === newLocation.user_id
                ? { ...member, location: newLocation }
                : member
            )
          )
        }
      )
      .subscribe()

    // Subscribe to party_members changes
    const membersChannel = supabase
      .channel(`party_members:${userPartyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_members',
          filter: `party_id=eq.${userPartyId}`,
        },
        () => {
          fetchPartyMembers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(locationChannel)
      supabase.removeChannel(membersChannel)
    }
  }, [userPartyId, supabase, fetchPartyMembers])

  // Fetch latest locations for all members
  useEffect(() => {
    if (!userPartyId || partyMembers.length === 0) return

    async function fetchLatestLocations() {
      try {
        const { data: locations } = await supabase
          .from('location_updates')
          .select('*')
          .eq('party_id', userPartyId)
          .order('created_at', { ascending: false })

        if (locations) {
          // Get the latest location for each user
          const latestByUser = new Map<string, LocationUpdate>()
          locations.forEach((loc) => {
            if (!latestByUser.has(loc.user_id)) {
              latestByUser.set(loc.user_id, loc)
            }
          })

          setPartyMembers((prev) =>
            prev.map((member) => ({
              ...member,
              location: latestByUser.get(member.user_id),
            }))
          )
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err)
      }
    }

    fetchLatestLocations()
  }, [userPartyId, supabase, partyMembers.length])

  // Convert party members to map markers
  const markers: MarkerData[] = partyMembers
    .filter((member) => member.location)
    .map((member) => ({
      id: member.user_id,
      latitude: member.location!.latitude,
      longitude: member.location!.longitude,
      displayName: member.profile.display_name || 'Anonymous',
      speed: member.location!.speed,
      heading: member.location!.heading,
      isCurrentUser: member.user_id === userId,
    }))

  if (currentLocation && userId) {
    const hasCurrentUserMarker = markers.some((marker) => marker.id === userId)
    if (!hasCurrentUserMarker) {
      const [longitude, latitude] = currentLocation
      markers.push({
        id: userId,
        latitude,
        longitude,
        displayName: 'You',
        isCurrentUser: true,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#FAFAFA] font-semibold">Loading Map...</p>
          <p className="text-[#A3A3A3] text-sm mt-2">Requesting location permission</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0C0C0C]">
        <nav className="bg-[#171717] border-b border-[#262626]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-extrabold text-[#FAFAFA]">SpeedLink Map</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#171717] border border-[#DC2626] rounded-xl p-6 text-center">
            <p className="text-[#DC2626] font-bold mb-4">{error}</p>
            <button
              onClick={() => router.push('/party')}
              className="bg-[#84CC16] text-black px-6 py-3 rounded-lg hover:bg-[#65A30D] transition-colors font-bold"
            >
              Go to Party Management
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col">
      <nav className="bg-[#171717] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-[#FAFAFA]">🏍️ Live Map</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/party')}
              className="bg-[#262626] text-[#FAFAFA] px-4 py-2 rounded-lg hover:bg-[#404040] transition-colors font-semibold"
            >
              Party
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#262626] text-[#FAFAFA] px-4 py-2 rounded-lg hover:bg-[#404040] transition-colors font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4">
        <div className="h-full max-w-7xl mx-auto space-y-4">
          {notice && (
            <div className="bg-[#171717] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] flex flex-wrap justify-between gap-3">
              <span>{notice}</span>
              <button
                onClick={() => router.push('/party')}
                className="bg-[#262626] text-[#FAFAFA] px-4 py-2 rounded-lg hover:bg-[#404040] transition-colors font-semibold"
              >
                Manage Party
              </button>
            </div>
          )}
          <MapView
            markers={markers}
            center={currentLocation}
            zoom={14}
            className="h-[calc(100vh-120px)]"
          />
        </div>
      </main>

      {/* Party info overlay */}
      {userPartyId && (
        <div className="absolute top-20 left-4 bg-[#0C0C0C]/90 border border-[#262626] rounded-lg p-4 backdrop-blur-sm max-w-xs">
          <h3 className="text-[#84CC16] font-bold mb-2">Party Members ({partyMembers.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {partyMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="text-[#FAFAFA] font-medium">
                  {member.profile.display_name || 'Anonymous'}
                  {member.user_id === userId && ' (You)'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  member.is_online ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#DC2626]/20 text-[#DC2626]'
                }`}>
                  {member.is_online ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
