'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] px-4">
      <div className="max-w-md w-full bg-[#171717] border border-[#262626] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#FAFAFA]">SpeedLink</h1>
          <p className="text-[#A3A3A3] mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[#DC2626]/10 border border-[#DC2626] text-[#DC2626] rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#FAFAFA] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0C0C0C] border border-[#262626] text-[#FAFAFA] rounded-lg focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-colors min-h-12"
              placeholder="you@example.com"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#FAFAFA] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0C0C0C] border border-[#262626] text-[#FAFAFA] rounded-lg focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-colors min-h-12"
              placeholder="••••••••"
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] text-black py-3 px-4 rounded-lg hover:bg-[#73B812] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold min-h-12"
            aria-label="Sign in to your account"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#262626]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#171717] text-[#A3A3A3]">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-[#0C0C0C] border border-[#262626] text-[#FAFAFA] py-3 px-4 rounded-lg hover:border-[#84CC16] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold min-h-[48px]"
            aria-label="Sign in with GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-[#A3A3A3]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#84CC16] hover:text-[#73B812] font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
