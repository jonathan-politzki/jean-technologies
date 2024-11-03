import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      console.error('No code provided');
      return NextResponse.redirect(new URL('/?error=missing_code', requestUrl.origin));
    }

    // Create a Supabase client configured to use cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error.message);
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }

    // Successful authentication, redirect to home page
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.redirect(new URL('/?error=unexpected_error', requestUrl.origin));
  }
}