import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  console.log({
    type: 'auth-callback-entry',
    url: request.url,
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
  } catch (error) {
    console.error('Auth callback error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }
}