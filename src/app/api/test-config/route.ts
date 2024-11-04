// src/app/api/test-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
    },
    linkedin: {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? 'configured' : 'missing',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'configured' : 'missing'
    },
    auth: {
      callbackUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
    }
  });
}