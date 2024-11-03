import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|_next/data|images/).*)'
  ],
  runtime: 'edge'
};

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ 
      req: request, 
      res
    });
    
    await supabase.auth.getSession();
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}