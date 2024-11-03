import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createEdgeClient } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    // Use edge-compatible client
    const supabase = createEdgeClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    // Set cookies for the session
    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL('/', requestUrl.origin));
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;

  } catch (error) {
    console.error('Auth error:', error);
    const baseUrl = new URL(request.url).origin;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMsg)}`, baseUrl),
      {
        status: 302,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}