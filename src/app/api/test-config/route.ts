// src/app/api/test-config/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test provider configuration
    const { data, error } = await supabase
      .from('auth.providers')
      .select('*')
      .filter('provider', 'eq', 'linkedin_oidc')
      .single();

    // Current deployment info
    const deploymentUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL;

    return NextResponse.json({
      status: 'success',
      config: {
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          linkedinProvider: data || 'not found'
        },
        linkedin: {
          hasClientId: !!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
          hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
          provider: 'linkedin_oidc'
        },
        deployment: {
          url: deploymentUrl,
          environment: process.env.NODE_ENV,
          vercelUrl: process.env.VERCEL_URL
        }
      }
    });
  } catch (error) {
    console.error('Config test error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { 
      status: 500 
    });
  }
}