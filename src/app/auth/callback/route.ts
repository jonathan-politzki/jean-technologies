// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        try {
            const { data: { session }, error: sessionError } = 
                await supabase.auth.exchangeCodeForSession(code);
            
            if (sessionError) throw sessionError;

            if (session?.user) {
                console.log('Creating user record...');
                
                // Create user record first
                const { error: userError } = await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        email: session.user.email,
                        updated_at: new Date().toISOString()
                    }, { 
                        onConflict: 'id' 
                    });

                if (userError) {
                    console.error('User creation error:', userError);
                }

                // Then create social profile
                if (session.provider_token) {
                    console.log('Creating social profile...');
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
                            onConflict: 'user_id,platform'
                        });

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                    }
                }
            }

            return NextResponse.redirect(new URL('/', request.url));
        } catch (error) {
            console.error('Callback error:', error);
            return NextResponse.redirect(
                new URL(`/?error=${encodeURIComponent(String(error))}`, request.url)
            );
        }
    }

    return NextResponse.redirect(new URL('/', request.url));
}