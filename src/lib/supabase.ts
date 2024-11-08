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

// For server-side operations with additional configuration
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  }
);

// For client-side operations (singleton)
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const getSupabase = () => {
  if (typeof window === 'undefined') return supabase; // Use server client for SSR
  
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>({
      options: {
        global: {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      }
    });
  }
  return clientInstance;
};

// Helper to ensure we're using the right client
export const getClient = (isServer = false) => {
  if (isServer) {
    return supabase;
  }
  return getSupabase();
};