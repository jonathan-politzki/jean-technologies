// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] Auth callback started`, {
        code: code ? 'present' : 'missing',
        params: Object.fromEntries(requestUrl.searchParams)
    });

    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        if (!code) {
            throw new Error('No code provided');
        }

        const { data: { session }, error: sessionError } = 
            await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) throw sessionError;

        if (session?.provider_token && session.user) {
            // Store the social profile
            const { error: profileError } = await supabase
                .from('social_profiles')
                .upsert({
                    user_id: session.user.id,
                    platform: session.user.app_metadata.provider,
                    platform_user_id: session.user.id,
                    access_token: session.provider_token,
                    refresh_token: session.provider_refresh_token || null,
                    profile_data: session.user.user_metadata,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,platform',
                    ignoreDuplicates: false
                });

            if (profileError) {
                console.error(`[${timestamp}] Profile storage error:`, profileError);
            }
        }

        return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (error) {
        console.error(`[${timestamp}] Auth callback error:`, error);
        return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent(String(error))}`, requestUrl.origin)
        );
    }
}