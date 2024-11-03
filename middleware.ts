import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ 
      req: request, 
      res
    });
    
    await supabase.auth.getSession();
    return res;
  } catch (error) {
    return NextResponse.next();
  }
}

// Only run middleware on auth-required routes
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*'
  ]
};