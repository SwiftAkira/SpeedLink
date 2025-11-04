import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <nav className="bg-[#171717] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-[#FAFAFA]">SpeedLink</h1>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="bg-[#DC2626] text-white px-4 py-2 rounded-lg hover:bg-[#B91C1C] transition-colors font-semibold min-h-11"
              aria-label="Sign out of your account"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-extrabold text-[#84CC16] mb-4">Welcome to SpeedLink! 🏍️</h2>
          <div className="space-y-3 text-[#A3A3A3]">
            <p><strong className="text-[#FAFAFA]">Email:</strong> {user.email}</p>
            <p><strong className="text-[#FAFAFA]">User ID:</strong> {user.id}</p>
            <p className="pt-4 text-[#FAFAFA]">You&apos;re successfully authenticated! Next up:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create your profile</li>
              <li>Join or create a party</li>
              <li>Share your location with friends</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
            <h3 className="font-bold text-[#FAFAFA] mb-2">Profile Setup</h3>
            <p className="text-sm text-[#A3A3A3] mb-6">Complete your profile with display name and preferences</p>
            <Link
              href="/profile"
              className="bg-[#84CC16] text-black px-4 py-3 rounded-lg hover:bg-[#73B812] transition-colors text-sm font-bold min-h-11 flex items-center justify-center"
            >
              Setup Profile
            </Link>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
            <h3 className="font-bold text-[#FAFAFA] mb-2">Party Management</h3>
            <p className="text-sm text-[#A3A3A3] mb-6">Create or join a riding group with 6-digit codes</p>
            <Link
              href="/party"
              className="bg-[#84CC16] text-black px-4 py-3 rounded-lg hover:bg-[#73B812] transition-colors text-sm font-bold min-h-11 flex items-center justify-center"
            >
              Manage Party
            </Link>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-6 hover:border-[#84CC16] transition-colors">
            <h3 className="font-bold text-[#FAFAFA] mb-2">Live Map</h3>
            <p className="text-sm text-[#A3A3A3] mb-6">View real-time locations of party members</p>
            <Link
              href="/map"
              className="bg-[#84CC16] text-black px-4 py-3 rounded-lg hover:bg-[#73B812] transition-colors text-sm font-bold min-h-11 flex items-center justify-center"
            >
              Open Map
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
