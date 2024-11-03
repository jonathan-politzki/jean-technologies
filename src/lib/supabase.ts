import { createClient } from '@supabase/supabase-js';

const createSupabaseClient = (isEdge = false) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: !isEdge,
      detectSessionInUrl: true,
      autoRefreshToken: !isEdge
    },
    global: {
      headers: {
        'x-client-info': '@supabase/auth-helpers-nextjs'
      },
      fetch: isEdge ? fetch : undefined
    }
  });
};

// Create a singleton instance for regular use
export const supabase = createSupabaseClient(false);

// For edge functions, create a new instance with edge-specific config
export const createEdgeClient = () => createSupabaseClient(true);
