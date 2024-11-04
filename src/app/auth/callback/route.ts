import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { handleError } from '@/utils/errors';
import { getRouteHandler } from '@/lib/supabase/config';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const cookieStore = cookies();
    
    const supabase = getRouteHandler(() => cookieStore);

    const code = requestUrl.searchParams.get('code');
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

    return NextResponse.redirect(new URL('/', requestUrl.origin), {
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
      new URL(`/?error=${encodeURIComponent(jeanError.message)}`, requestUrl.origin),
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
}