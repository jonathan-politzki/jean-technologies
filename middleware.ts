import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

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

    // Get session but don't wait for it
    supabase.auth.getSession().catch(console.error);
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Exclude static files, API routes, and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|api/|_next/data|images/).*)'
  ]
};