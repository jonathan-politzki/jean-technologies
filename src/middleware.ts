// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ 
      req: request, 
      res
    });
    
    await supabase.auth.getSession();
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