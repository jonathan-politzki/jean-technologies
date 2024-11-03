import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = async (request: NextRequest) => {
  try {
    // Required for authentication to work from edge functions
    const requestHeaders = new Headers(request.headers);
    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    const supabase = createMiddlewareClient({ req: request, res });

    await supabase.auth.getSession();

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
};

// This ensures middleware runs on the appropriate paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};