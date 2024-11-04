// src/hooks/useSocialConnect.ts
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Platform, SocialProfile } from '@/lib/types';
import { handleError } from '@/utils/errors';
import { Provider } from '@supabase/supabase-js';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClientComponentClient();

    const connectPlatform = async (platform: Platform): Promise<void> => {
        try {
            const timestamp = new Date().toISOString();
            setLoading(true);
            setError(null);

            const redirectUrl = `${window.location.origin}/auth/callback`;
            const supabaseCallbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`;

            console.log(`[${timestamp}] Initiating ${platform} connection:`, {
                platform,
                redirectUrl,
                supabaseCallbackUrl,
                clientId: platform === 'linkedin' ? (process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? 'configured' : 'missing') : 'n/a'
            });

            let options = {
                redirectTo: redirectUrl,
                scopes: getPlatformScopes(platform)
            };

            if (platform === 'linkedin') {
                // Only add LinkedIn specific options if clientId is available
                const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
                if (!clientId) {
                    console.warn(`[${timestamp}] LinkedIn client ID not configured`);
                }

                options = {
                    ...options,
                    queryParams: {
                        response_type: 'code',
                        prompt: 'consent'
                    }
                };
            }

            console.log(`[${timestamp}] OAuth configuration:`, {
                provider: platform,
                scopes: options.scopes,
                options: {
                    ...options,
                    queryParams: options.queryParams ? 'configured' : 'not needed'
                }
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform as Provider,
                options
            });

            if (oauthError) {
                console.error(`[${timestamp}] OAuth error:`, {
                    code: oauthError.code,
                    message: oauthError.message,
                    status: oauthError.status
                });
                throw oauthError;
            }

            console.log(`[${timestamp}] OAuth success:`, {
                hasData: !!data,
                url: data?.url ? 'provided' : 'missing',
                provider: platform
            });

        } catch (err) {
            const timestamp = new Date().toISOString();
            console.error(`[${timestamp}] Connection error:`, {
                error: err instanceof Error ? {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                } : 'Unknown error type',
                platform
            });
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Fetching connected platforms`);
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*');

            if (fetchError) {
                console.error(`[${timestamp}] Fetch error:`, fetchError);
                throw fetchError;
            }

            console.log(`[${timestamp}] Found platforms:`, {
                count: data?.length || 0,
                platforms: data?.map(p => p.platform) || []
            });

            return data || [];
        } catch (err) {
            console.error(`[${timestamp}] Get platforms error:`, err);
            setError(handleError(err));
            return [];
        } finally {
            setLoading(false);
        }
    };

    const disconnectPlatform = async (platform: Platform): Promise<void> => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Disconnecting platform:`, platform);
            setLoading(true);
            setError(null);

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (disconnectError) {
                console.error(`[${timestamp}] Disconnect error:`, disconnectError);
                throw disconnectError;
            }

            console.log(`[${timestamp}] Successfully disconnected:`, platform);
        } catch (err) {
            console.error(`[${timestamp}] Disconnect error:`, err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getPlatformScopes = (platform: Platform): string => {
        const scopes: Record<Platform, string> = {
            linkedin: 'openid profile w_member_social email',
            google: 'profile email',
            github: 'read:user user:email'
        };

        const scopeString = scopes[platform] || '';
        console.log(`Platform scopes for ${platform}:`, scopeString);
        return scopeString;
    };

    return {
        connectPlatform,
        getConnectedPlatforms,
        disconnectPlatform,
        loading,
        error
    };
}