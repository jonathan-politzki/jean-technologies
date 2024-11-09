// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Client-side singleton instance
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Function to get the client-side instance
export function getClientSupabase() {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>()
  }
  return clientInstance
}

// Route handler (API) client creation function
export function getRouteSupabase() {
  return createRouteHandlerClient<Database>({ cookies })
}

// Hook for component use
export function useSupabase() {
  return getClientSupabase()
}