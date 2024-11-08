// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// For server-side operations
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// For client-side operations (singleton)
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // For server-side operations, use the server client
    return supabase;
  }
  
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
}

// Export a hook for component use
export function useSupabaseClient() {
  return getSupabaseClient();
}