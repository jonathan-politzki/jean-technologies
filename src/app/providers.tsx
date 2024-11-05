// src/app/providers.tsx
'use client'

import { createContext, useContext, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../lib/database.types'

// Create a singleton instance
const supabaseClient = createClientComponentClient<Database>()

const SupabaseContext = createContext(supabaseClient)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabaseClient}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return useContext(SupabaseContext)
}