// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log("Auth callback hit", { url: request.url }); // Add logging

  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (!code) {
      throw new Error('No code provided');
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    // Redirect to home on success
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    // Redirect to home with error
    return NextResponse.redirect(new URL('/?error=auth_callback_error', request.url));
  }
}