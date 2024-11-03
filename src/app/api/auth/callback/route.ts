import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Remove force-dynamic and handle caching explicitly
export const runtime = 'edge';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=missing_code', requestUrl.origin),
        { status: 302 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error.message);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
        { status: 302 }
      );
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin), {
      status: 302
    });
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=unexpected_error', new URL(request.url).origin),
      { status: 302 }
    );
  }
}