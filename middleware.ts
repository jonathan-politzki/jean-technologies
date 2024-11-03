import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ 
      req: request, 
      res
    });
    
    await supabase.auth.getSession();
    return res;
  } catch (error) {
    // On error, still allow the request to proceed
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};