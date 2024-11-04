// src/app/auth/callback/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleError } from '@/utils/errors'
import { getRouteHandler } from '@/lib/supabase/config'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const cookieStore = cookies()
  const supabase = getRouteHandler(() => cookieStore)

  try {
    const code = url.searchParams.get('code')
    if (!code) {
      throw new Error('No code provided')
    }
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) throw error

    return NextResponse.redirect(new URL('/', url.origin), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error: unknown) {
    const jeanError = handleError(error)
    
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(jeanError.message)}`, url.origin),
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    )
  }
}