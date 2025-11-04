import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <nav className="bg-[#171717] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-[#FAFAFA]">SpeedLink</h1>
          <a href="/dashboard" className="text-[#84CC16] hover:text-[#73B812] font-semibold min-h-11 flex items-center">
            ← Back to Dashboard
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#171717] border border-[#262626] rounded-xl p-8">
          <h2 className="text-2xl font-extrabold text-[#FAFAFA] mb-8">Profile Settings</h2>
          <ProfileForm profile={profile} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
