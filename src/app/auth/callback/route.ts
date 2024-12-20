// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('hitting callback')

  console.log('supabase', code, next, origin)
  if (code) {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = 
      await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect('/error')
    }

    if (session?.user) {
        const providerId = session.user.user_metadata.provider_id;

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          updated_at: new Date().toISOString(),
          full_name: session.user.user_metadata.full_name,
          avatar_url: session.user.user_metadata.avatar_url
        }, {
          onConflict: 'id'
        }).select();

      if (userError) {
        console.error('User creation error:', userError)
      }

      const iss = session.user.user_metadata.iss

      console.dir(session, { depth: null })

      // Create social profile if provider token exists
      if (session.access_token) {
        const { error: profileError } = await supabase
          .from('social_profiles')
          .upsert({
            user_id: session.user.id,
            platform: getPlatform(iss),
            platform_user_id: providerId,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            profile_data: session.user.user_metadata,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'platform_user_id'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
    }

    if (!sessionError) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
  }
}

  return NextResponse.redirect(`${origin}/error`)
}

const getPlatform = (iss: string) => {
  if (iss.includes('google')) return 'google'
  if (iss.includes('github')) return 'github'
  if (iss.includes('linkedin')) return 'linkedin'
  return ""
}