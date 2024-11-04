import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMiddlewareClient } from '@/lib/supabase/config';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = getMiddlewareClient(request, res);
    
    // Refresh session if needed
    await supabase.auth.getSession();
    
    // Add cache control headers
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/auth/callback',
    '/api/auth/callback',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};