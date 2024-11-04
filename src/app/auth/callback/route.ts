// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { LinkedInClient } from '@/lib/linkedin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Auth callback started`);

    try {
        const requestUrl = new URL(request.url);
        const code = requestUrl.searchParams.get('code');
        const provider = requestUrl.searchParams.get('provider');
        const error = requestUrl.searchParams.get('error');
        const error_description = requestUrl.searchParams.get('error_description');
        
        console.log(`[${timestamp}] Callback details:`, {
            code: code ? 'present' : 'missing',
            provider,
            error,
            error_description,
            searchParams: Object.fromEntries(requestUrl.searchParams),
            headers: Object.fromEntries(request.headers)
        });

        if (error || error_description) {
            console.error(`[${timestamp}] OAuth error:`, { error, error_description });
            throw new Error(`OAuth error: ${error_description || error}`);
        }

        if (!code) {
            console.error(`[${timestamp}] No code provided`);
            throw new Error('No code provided');
        }

        const supabase = createRouteHandlerClient({ cookies });
        console.log(`[${timestamp}] Exchanging code for session`);
        
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error(`[${timestamp}] Session exchange error:`, sessionError);
            throw sessionError;
        }

        console.log(`[${timestamp}] Session exchange successful:`, {
            userId: session?.user?.id,
            provider: session?.user?.app_metadata?.provider,
            hasAccessToken: !!session?.access_token,
            hasRefreshToken: !!session?.refresh_token
        });

        // Debug provider-specific data
        if (session?.provider_token) {
            try {
                console.log(`[${timestamp}] Attempting to fetch provider profile`);
                if (provider === 'linkedin') {
                    const linkedinClient = new LinkedInClient(session.provider_token);
                    const profile = await linkedinClient.getProfile();
                    console.log(`[${timestamp}] LinkedIn Profile:`, {
                        id: profile.id,
                        name: `${profile.firstName} ${profile.lastName}`,
                        hasEmail: !!profile.email
                    });
                }
            } catch (e) {
                console.error(`[${timestamp}] Provider API Error:`, e);
            }
        }

        console.log(`[${timestamp}] Auth successful, redirecting to home`);
        return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (error) {
        console.error(`[${timestamp}] Auth callback error:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        return NextResponse.redirect(
            new URL(
                `/?error=auth_callback_error&message=${encodeURIComponent(String(error))}`,
                request.url
            )
        );
    }
}