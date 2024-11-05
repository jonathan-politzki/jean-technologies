'use client'

import { createContext, useContext, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../lib/database.types'

const SupabaseContext = createContext<ReturnType<typeof createClientComponentClient<Database>> | null>(null)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClientComponentClient<Database>(), [])

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}