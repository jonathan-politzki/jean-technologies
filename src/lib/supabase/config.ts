// src/lib/supabase/config.ts
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest, NextResponse } from 'next/server';

const SUPABASE_CONFIG = {
  auth: {
    flowType: 'pkce' as const,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
};

export function getClientComponent() {
  return createClientComponentClient({
    options: SUPABASE_CONFIG
  });
}

export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ 
    req,
    res,
    options: SUPABASE_CONFIG
  });
}

// For direct API usage (not route handlers)
export function getBaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: SUPABASE_CONFIG.auth,
      global: {
        headers: {
          'x-client-info': '@supabase/auth-helpers-nextjs'
        }
      }
    }
  );
}