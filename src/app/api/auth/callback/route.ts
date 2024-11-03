import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    console.log('Auth callback called with code:', !!code);

    if (!code) {
      console.error('No code provided');
      return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin));
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Exchange error:', error);
      return NextResponse.redirect(new URL(`/?error=${error.message}`, requestUrl.origin));
    }

    if (!data.session) {
      console.error('No session returned');
      return NextResponse.redirect(new URL('/?error=no_session', requestUrl.origin));
    }

    // Successful auth
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    // Return a more graceful error response
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
}