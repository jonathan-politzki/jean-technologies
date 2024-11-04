// src/app/api/test-config/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test Supabase auth settings
    const { data: providers } = await supabase
      .from('auth.providers')
      .select('*')
      .eq('provider', 'linkedin')
      .single();

    return NextResponse.json({
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
        provider: providers || 'not found'
      },
      linkedin: {
        clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'present' : 'missing'
      },
      environment: process.env.NODE_ENV,
      auth: {
        callbackUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}