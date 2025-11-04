'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  location_sharing_enabled: boolean
  visible_to_party: boolean
  ghost_mode: boolean
}

interface ProfileFormProps {
  profile: Profile | null
  userId: string
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [locationSharing, setLocationSharing] = useState(profile?.location_sharing_enabled ?? true)
  const [visibleToParty, setVisibleToParty] = useState(profile?.visible_to_party ?? true)
  const [ghostMode, setGhostMode] = useState(profile?.ghost_mode ?? false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        location_sharing_enabled: locationSharing,
        visible_to_party: visibleToParty,
        ghost_mode: ghostMode,
      })
      .eq('id', userId)

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your display name"
        />
        <p className="mt-1 text-sm text-gray-500">This is how other riders will see you</p>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={profile?.email || ''}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        
        {/* Location Sharing */}
        <div className="flex items-start mb-4">
          <div className="flex items-center h-5">
            <input
              id="locationSharing"
              type="checkbox"
              checked={locationSharing}
              onChange={(e) => setLocationSharing(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="locationSharing" className="font-medium text-gray-700">
              Enable Location Sharing
            </label>
            <p className="text-sm text-gray-500">
              Share your real-time location with party members
            </p>
          </div>
        </div>

        {/* Visible to Party */}
        <div className="flex items-start mb-4">
          <div className="flex items-center h-5">
            <input
              id="visibleToParty"
              type="checkbox"
              checked={visibleToParty}
              onChange={(e) => setVisibleToParty(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="visibleToParty" className="font-medium text-gray-700">
              Visible to Party Members
            </label>
            <p className="text-sm text-gray-500">
              Show your presence in the party (even without location)
            </p>
          </div>
        </div>

        {/* Ghost Mode */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="ghostMode"
              type="checkbox"
              checked={ghostMode}
              onChange={(e) => setGhostMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="ghostMode" className="font-medium text-gray-700">
              Ghost Mode 👻
            </label>
            <p className="text-sm text-gray-500">
              Completely invisible - you can see others but they can&apos;t see you
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Profile Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Privacy Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Location sharing only works when you&apos;re in an active party</li>
          <li>• Ghost mode lets you scout the route without being seen</li>
          <li>• You can toggle these settings anytime during a ride</li>
        </ul>
      </div>
    </form>
  )
}
