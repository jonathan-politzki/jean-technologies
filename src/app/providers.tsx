'use client'

import { createContext, useContext } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../lib/database.types'

// Create a singleton instance outside of any component
const supabase = createClientComponentClient<Database>()

const SupabaseContext = createContext<typeof supabase | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}