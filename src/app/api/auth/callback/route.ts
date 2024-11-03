import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin), {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

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