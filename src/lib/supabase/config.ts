// src/lib/supabase/config.ts

import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest, NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/auth-helpers-nextjs'

const SUPABASE_AUTH_CONFIG = {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
} as const

export function getBaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: SUPABASE_AUTH_CONFIG.auth,
      global: {
        headers: {
          'x-client-info': '@supabase/auth-helpers-nextjs'
        }
      }
    }
  )
}

export function getClientComponent() {
  return createClientComponentClient({
    options: {
      ...SUPABASE_AUTH_CONFIG
    }
  })
}

export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ 
    req,
    res,
    options: {
      ...SUPABASE_AUTH_CONFIG
    }
  })
}

export function getRouteHandler(cookies: () => CookieOptions['cookies']) {
  return createRouteHandlerClient({ 
    cookies,
    options: {
      ...SUPABASE_AUTH_CONFIG
    }
  })
}

// Edge-specific client
export function getEdgeClient() {
  return getBaseClient()
}