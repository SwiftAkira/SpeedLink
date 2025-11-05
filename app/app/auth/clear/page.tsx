'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClearAuthPage() {
  const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const clearAuth = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut()
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          // Clear all Supabase keys
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.startsWith('speedlink-') || key.includes('supabase')) {
              localStorage.removeItem(key)
            }
          })
          
          // Clear session cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
          })
        }
        
        setStatus('success')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } catch (error) {
        console.error('Error clearing auth:', error)
        setStatus('error')
      }
    }

    clearAuth()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] px-4">
      <div className="max-w-md w-full bg-[#171717] border border-[#262626] rounded-xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-[#FAFAFA] mb-4">
          {status === 'clearing' && 'Clearing Authentication...'}
          {status === 'success' && '✓ Authentication Cleared'}
          {status === 'error' && 'Error Clearing Auth'}
        </h1>
        
        <p className="text-[#A3A3A3] mb-6">
          {status === 'clearing' && 'Please wait while we clear your session data...'}
          {status === 'success' && 'Your session has been cleared. Redirecting to login...'}
          {status === 'error' && 'There was an error clearing your session.'}
        </p>

        {status === 'success' && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84CC16] mx-auto"></div>
        )}

        {status === 'error' && (
          <Link 
            href="/login"
            className="inline-block bg-[#84CC16] text-[#0C0C0C] px-6 py-3 rounded-lg font-semibold hover:bg-[#9AE620] transition-colors"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  )
}
