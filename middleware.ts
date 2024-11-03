import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Explicitly set edge runtime
export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Skip middleware for static files and API routes
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api')) {
    return res;
  }

  const supabase = createMiddlewareClient({ 
    req: request, 
    res
  });
  
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
};