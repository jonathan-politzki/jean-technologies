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

        if (session?.user) {
            // First ensure user exists
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    updated_at: new Date().toISOString()
                });

            console.log(`[${timestamp}] User creation/update:`, { 
                success: !userError, 
                error: userError,
                userId: session.user.id
            });

            // Then handle social profile
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

            console.log(`[${timestamp}] Profile creation/update:`, {
                success: !profileError,
                error: profileError,
                userId: session.user.id,
                platform: session.user.app_metadata.provider
            });
        }

        return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (error) {
        console.error(`[${timestamp}] Auth callback error:`, error);
        return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent(String(error))}`, requestUrl.origin)
        );
    }
}