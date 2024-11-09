// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Client-side singleton instance
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Server-side client
export const createServerSupabaseClient = () => 
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// Client-side singleton getter
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // For server-side operations, create a new instance
    return createServerSupabaseClient();
  }
  
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }
  return clientInstance;
}

// React hook for component use
export function useSupabaseClient() {
  return getSupabaseClient();
}