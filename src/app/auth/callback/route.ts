import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { handleError } from '@/utils/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  console.log('🎯 Auth Callback Handler:', {
    type: 'entry',
    timestamp: new Date().toISOString(),
    url: request.url,
    pathname: requestUrl.pathname,
    search: requestUrl.search,
    code: requestUrl.searchParams.get('code'),
    headers: Object.fromEntries(request.headers)
  });

  try {
    const code = requestUrl.searchParams.get('code');
    if (!code) {
      throw new Error('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log({
      type: 'auth-exchange-result',
      success: !error,
      error: error?.message
    });

    if (error) throw error;

    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error: unknown) {
    const jeanError = handleError(error);
    console.error('Auth callback error:', {
      code: jeanError.code,
      message: jeanError.message,
      statusCode: jeanError.statusCode
    });
    
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(jeanError.message)}`, requestUrl.origin)
    );
  }
}