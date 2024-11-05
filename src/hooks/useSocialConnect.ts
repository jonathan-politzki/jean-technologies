// src/hooks/useSocialConnect.ts
import { useState, useCallback } from 'react';
import { useSupabase } from '../app/providers';
import { Platform, SocialProfile } from '../lib/types';
import { handleError } from '../utils/errors';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = useSupabase();

    const getConnectedPlatforms = useCallback(async (): Promise<SocialProfile[]> => {
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

            if (userError) throw userError;
            if (!user) {
                console.log(`[${timestamp}] No authenticated user found`);
                return [];
            }

            // Query social profiles
            console.log(`[${timestamp}] Querying social profiles for user:`, user.id);
            const { data: profiles, error: profileError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (profileError) {
                console.error(`[${timestamp}] Profile fetch error:`, profileError);
                throw profileError;
            }

            console.log(`[${timestamp}] Found ${profiles?.length || 0} profiles`);
            return profiles as SocialProfile[] || [];

        } catch (err) {
            console.error(`[${timestamp}] Get platforms error:`, err);
            setError(handleError(err));
            return [];
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const connectPlatform = useCallback(async (platform: Platform): Promise<void> => {
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
                        prompt: 'consent',
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
    }, [supabase]);

    const disconnectPlatform = useCallback(async (platform: Platform): Promise<void> => {
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

            // First, find the specific profile to delete
            const { data: profiles, error: findError } = await supabase
                .from('social_profiles')
                .select('id')
                .match({ 
                    user_id: user.id,
                    platform: platform 
                });

            if (findError) {
                console.error(`[${timestamp}] Find profile error:`, findError);
                throw findError;
            }

            if (!profiles?.length) {
                console.log(`[${timestamp}] No profile found to disconnect`);
                return;
            }

            // Delete the profile
            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('id', profiles[0].id);

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
    }, [supabase]);

    return {
        connectPlatform,
        getConnectedPlatforms,
        disconnectPlatform,
        loading,
        error
    };
}