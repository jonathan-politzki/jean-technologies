import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Create a response object
    const res = NextResponse.next();
    
    // Create a Supabase client specifically for the edge
    const supabase = createMiddlewareClient({ 
      req: request, 
      res,
      options: {
        auth: {
          persistSession: false
        }
      }
    });

    // Get the session without persistence
    await supabase.auth.getSession();
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Only match auth-related paths and main pages
    '/',
    '/api/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public/.*|api/(?!auth)).*)'
  ]
};