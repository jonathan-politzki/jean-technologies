import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestInfo = {
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    hasCode: request.nextUrl.searchParams.has('code'),
    code: request.nextUrl.searchParams.get('code'),
    headers: Object.fromEntries(request.headers),
    url: request.url,
    nextUrl: {
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
      href: request.nextUrl.href
    }
  };
  
  console.log('🔍 Request Debug:', JSON.stringify(requestInfo, null, 2));
  
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

// Match ALL routes to debug the full request flow
export const config = {
  matcher: [
    '/auth/callback',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 