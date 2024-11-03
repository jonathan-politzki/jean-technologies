import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Early return for static files and API routes
  if (request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ 
      req: request, 
      res,
      options: {
        auth: {
          persistSession: false
        },
        global: {
          fetch: fetch.bind(globalThis)
        }
      }
    });
    
    await supabase.auth.getSession();
    return res;
  } catch (error) {
    // If middleware fails, still allow the request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/|_next/data|images/).*)'
  ]
};