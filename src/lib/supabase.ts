import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: true,
      autoRefreshToken: true
    },
    global: {
      headers: {
        'x-client-info': '@supabase/auth-helpers-nextjs'
      }
    }
  });
};

// Create a singleton instance
export const supabase = createSupabaseClient();

// For edge functions, create a new instance each time
export const createEdgeClient = () => createSupabaseClient();
