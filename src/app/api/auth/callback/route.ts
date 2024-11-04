import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AuthenticationError, handleError } from '@/utils/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('Auth callback received:', request.url);
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    console.log('Auth code received:', code ? 'yes' : 'no');

    if (!code) {
      throw new AuthenticationError('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('Exchange completed:', error ? 'with error' : 'success');

    if (error) {
      throw new AuthenticationError(error.message);
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    const jeanError = handleError(error);
    console.error('Detailed auth error:', jeanError);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(jeanError.message)}`, request.url)
    );
  }
}