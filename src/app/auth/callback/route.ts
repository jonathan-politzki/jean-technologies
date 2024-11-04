// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { LinkedInClient } from '@/lib/linkedin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Auth callback started`, {
        url: request.url,
        headers: Object.fromEntries(request.headers)
    });

    try {
        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get('code');
        
        console.log(`[${timestamp}] Code received:`, { 
            hasCode: !!code,
            searchParams: Object.fromEntries(requestUrl.searchParams)
        });

        if (!code) {
            throw new Error('No code provided');
        }

        const supabase = createRouteHandlerClient({ cookies });
        console.log(`[${timestamp}] Exchanging code for session`);
        
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error(`[${timestamp}] Session exchange error:`, error);
            throw error;
        }

        // Debug LinkedIn data if available
        if (session?.provider_token && session?.user?.app_metadata?.provider === 'linkedin') {
            try {
                console.log(`[${timestamp}] Attempting to fetch LinkedIn profile`);
                const linkedinClient = new LinkedInClient(session.provider_token);
                const profile = await linkedinClient.getProfile();
                console.log(`[${timestamp}] LinkedIn Profile:`, profile);
            } catch (e) {
                console.error(`[${timestamp}] LinkedIn API Error:`, e);
            }
        }

        console.log(`[${timestamp}] Auth successful, redirecting to home`);
        return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (error) {
        console.error(`[${timestamp}] Auth callback error:`, error);
        return NextResponse.redirect(new URL('/?error=auth_callback_error', request.url));
    }
}