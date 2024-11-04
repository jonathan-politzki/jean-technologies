import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all relevant request information
  console.log({
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    hasCode: request.nextUrl.searchParams.has('code'),
    headers: Object.fromEntries(request.headers)
  });

  return NextResponse.next();
}

// Match ALL routes to debug the full request flow
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 