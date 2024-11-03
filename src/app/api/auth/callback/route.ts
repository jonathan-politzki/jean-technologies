import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (request.method === 'OPTIONS') {
    return new NextResponse('ok', { status: 200 });
  }

  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    if (!code) {
      throw new Error('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    // URL to redirect to after sign in process completes
    const redirectUrl = new URL(next, requestUrl.origin);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Auth callback error:', error);
    // Return a more graceful error response
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(redirectUrl);
  }
}