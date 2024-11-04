import { createClient } from '@supabase/supabase-js';

const createSupabaseClient = (isEdge = false) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: !isEdge,
        detectSessionInUrl: !isEdge,
        autoRefreshToken: !isEdge,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-client-info': '@supabase/auth-helpers-nextjs'
        }
      }
    }
  );
};

let supabaseInstance: ReturnType<typeof createSupabaseClient>;

// Create a singleton instance for regular use
export const supabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(false);
  }
  return supabaseInstance;
};

// For edge functions, create a new instance with edge-specific config
export const createEdgeClient = () => createSupabaseClient(true);