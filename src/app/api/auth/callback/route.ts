import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('Auth callback received:', request.url);
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    console.log('Auth code received:', code ? 'yes' : 'no');

    if (!code) {
      throw new Error('No code provided');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('Exchange completed:', error ? 'with error' : 'success');

    if (error) {
      throw error;
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error: any) {
    console.error('Detailed auth error:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}