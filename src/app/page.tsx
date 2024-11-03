'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Failed to get session')
      }
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignIn = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: new URL('/auth/callback', window.location.origin).toString()
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Failed to sign in with Google. Please try again.')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {user ? (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-gray-600">{user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      )}
    </div>
  )
}