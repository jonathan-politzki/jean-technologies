// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // For server-side operations, always create a new instance
    return createClientComponentClient<Database>();
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