// src/hooks/useSocialConnect.ts
import { useState } from 'react';
import { getClientSupabase } from '@/lib/supabase';
import { Platform, SocialProfile } from '@/lib/types';
import { handleError } from '@/utils/errors';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = getClientSupabase();

    const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Starting getConnectedPlatforms`);
            setLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log(`[${timestamp}] User check:`, { 
                hasUser: !!user, 
                userId: user?.id,
                error: userError ? userError.message : null 
            });

            if (!user) {
                console.log(`[${timestamp}] No authenticated user found`);
                return [];
            }

            console.log(`[${timestamp}] Querying social profiles for user:`, user.id);
            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id)
                .throwOnError();

            if (fetchError) {
                console.error(`[${timestamp}] Social profiles fetch error:`, {
                    message: fetchError.message,
                    code: fetchError.code,
                    details: fetchError.details
                });
                throw fetchError;
            }

            console.log(`[${timestamp}] Successfully fetched profiles:`, {
                count: data?.length || 0,
                profiles: data
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

    const connectPlatform = async (platform: Platform): Promise<void> => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Starting ${platform} connection`);
            setLoading(true);
            setError(null);

            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin_oidc' 
                    ? 'openid profile w_member_social email'
                    : 'profile email',
            };

            console.log(`[${timestamp}] Initiating OAuth with options:`, {
                platform,
                redirectTo: options.redirectTo,
                scopes: options.scopes
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform === 'linkedin_oidc' ? 'linkedin_oidc' : platform,
                options: {
                    ...options,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });

            if (oauthError) {
                console.error(`[${timestamp}] OAuth error:`, oauthError);
                throw oauthError;
            }

            console.log(`[${timestamp}] OAuth initiated successfully:`, {
                hasUrl: !!data?.url
            });

        } catch (err) {
            console.error(`[${timestamp}] Connection error:`, err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const disconnectPlatform = async (platform: Platform): Promise<void> => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Starting disconnect for platform:`, platform);
            setLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error(`[${timestamp}] User fetch error:`, userError);
                throw userError;
            }

            if (!user) {
                console.error(`[${timestamp}] No authenticated user found`);
                throw new Error('No authenticated user');
            }

            console.log(`[${timestamp}] Deleting social profile:`, {
                userId: user.id,
                platform
            });

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform)
                .eq('user_id', user.id)
                .throwOnError();

            if (disconnectError) {
                console.error(`[${timestamp}] Disconnect error:`, disconnectError);
                throw disconnectError;
            }

            console.log(`[${timestamp}] Successfully disconnected ${platform}`);

        } catch (err) {
            console.error(`[${timestamp}] Disconnect error:`, err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    return {
        connectPlatform,
        getConnectedPlatforms,
        disconnectPlatform,
        loading,
        error
    };
}