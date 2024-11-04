import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestInfo = {
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    hasCode: request.nextUrl.searchParams.has('code'),
    code: request.nextUrl.searchParams.get('code'),
  };
  
  console.error('🚨 Auth Debug:', JSON.stringify(requestInfo, null, 2));
  
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export const config = {
  matcher: [
    '/auth/callback',
    '/api/auth/callback'
  ]
}; 