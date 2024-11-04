// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { handleError } from '@/utils/errors';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = cookies();
  
  // Create route handler client with cookie store
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookieStore,
  });

  try {
    const code = url.searchParams.get('code');
    if (!code) {
      throw new Error('No code provided');
    }
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) throw error;

    // After successful auth, get the user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No user found after authentication');
    }

    return NextResponse.redirect(new URL('/', url.origin), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: unknown) {
    const jeanError = handleError(error);
    console.error('Auth callback error:', {
      code: jeanError.code,
      message: jeanError.message,
      statusCode: jeanError.statusCode
    });
    
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(jeanError.message)}`, url.origin),
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
}