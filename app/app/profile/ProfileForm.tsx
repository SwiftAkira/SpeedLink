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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-[#FAFAFA] mb-3">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 min-h-12 bg-[#0C0C0C] border border-[#262626] rounded-lg focus:ring-2 focus:ring-[#84CC16] focus:border-[#84CC16] text-[#FAFAFA] placeholder:text-[#525252]"
          placeholder="Your display name"
        />
        <p className="mt-2 text-sm text-[#A3A3A3]">This is how other riders will see you</p>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-semibold text-[#FAFAFA] mb-3">
          Email
        </label>
        <input
          type="email"
          value={profile?.email || ''}
          disabled
          className="w-full px-4 py-3 min-h-12 bg-[#0C0C0C] border border-[#262626] rounded-lg text-[#737373] cursor-not-allowed"
        />
      </div>

      <div className="border-t border-[#262626] pt-8">
        <h3 className="text-lg font-bold text-[#FAFAFA] mb-6">Privacy Settings</h3>
        
        {/* Location Sharing */}
        <div className="flex items-start mb-6">
          <div className="flex items-center h-6">
            <input
              id="locationSharing"
              type="checkbox"
              checked={locationSharing}
              onChange={(e) => setLocationSharing(e.target.checked)}
              className="w-5 h-5 text-[#84CC16] bg-[#0C0C0C] border-[#262626] rounded focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>
          <div className="ml-4">
            <label htmlFor="locationSharing" className="font-semibold text-[#FAFAFA] cursor-pointer">
              Enable Location Sharing
            </label>
            <p className="text-sm text-[#A3A3A3] mt-1">
              Share your real-time location with party members
            </p>
          </div>
        </div>

        {/* Visible to Party */}
        <div className="flex items-start mb-6">
          <div className="flex items-center h-6">
            <input
              id="visibleToParty"
              type="checkbox"
              checked={visibleToParty}
              onChange={(e) => setVisibleToParty(e.target.checked)}
              className="w-5 h-5 text-[#84CC16] bg-[#0C0C0C] border-[#262626] rounded focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>
          <div className="ml-4">
            <label htmlFor="visibleToParty" className="font-semibold text-[#FAFAFA] cursor-pointer">
              Visible to Party Members
            </label>
            <p className="text-sm text-[#A3A3A3] mt-1">
              Show your presence in the party (even without location)
            </p>
          </div>
        </div>

        {/* Ghost Mode */}
        <div className="flex items-start">
          <div className="flex items-center h-6">
            <input
              id="ghostMode"
              type="checkbox"
              checked={ghostMode}
              onChange={(e) => setGhostMode(e.target.checked)}
              className="w-5 h-5 text-[#84CC16] bg-[#0C0C0C] border-[#262626] rounded focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>
          <div className="ml-4">
            <label htmlFor="ghostMode" className="font-semibold text-[#FAFAFA] cursor-pointer">
              Ghost Mode 👻
            </label>
            <p className="text-sm text-[#A3A3A3] mt-1">
              Completely invisible - you can see others but they can&apos;t see you
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-[#14532D] border-[#22C55E] text-[#22C55E]' 
            : 'bg-[#450A0A] border-[#DC2626] text-[#DC2626]'
        }`} role="alert">
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#84CC16] text-[#0C0C0C] py-3 min-h-12 px-6 rounded-lg hover:bg-[#73B812] active:bg-[#65A10C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 min-h-12 border-2 border-[#262626] text-[#FAFAFA] rounded-lg hover:bg-[#171717] active:bg-[#0C0C0C] transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* Profile Info */}
      <div className="mt-8 p-6 bg-[#0C0C0C] border border-[#262626] rounded-xl">
        <h4 className="font-bold text-[#84CC16] mb-3">💡 Privacy Tips</h4>
        <ul className="text-sm text-[#A3A3A3] space-y-2">
          <li>• Location sharing only works when you&apos;re in an active party</li>
          <li>• Ghost mode lets you scout the route without being seen</li>
          <li>• You can toggle these settings anytime during a ride</li>
        </ul>
      </div>
    </form>
  )
}
