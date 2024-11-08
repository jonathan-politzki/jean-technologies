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
        try {
            setLoading(true);
            setError(null);
    
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) return [];
    
            // Use explicit column selection instead of *
            const { data: profiles, error: profileError } = await supabase
                .from('social_profiles')
                .select(`
                    id,
                    user_id,
                    platform,
                    platform_user_id,
                    access_token,
                    refresh_token,
                    profile_data,
                    created_at,
                    updated_at
                `)
                .eq('user_id', user.id);
    
            if (profileError) throw profileError;
            return profiles || [];
    
        } catch (err) {
            console.error('Error:', err);
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

            const baseOptions = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin_oidc' 
                    ? 'openid profile email' 
                    : 'profile email',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            };

            console.log(`[${timestamp}] Initiating OAuth with options:`, {
                platform,
                ...baseOptions
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform,
                options: baseOptions
            });

            if (oauthError) {
                console.error(`[${timestamp}] OAuth error:`, oauthError);
                throw oauthError;
            }

            console.log(`[${timestamp}] OAuth initiated successfully:`, {
                hasUrl: !!data?.url,
                url: data?.url
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

            // Delete the profile with a single query
            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .match({ 
                    user_id: user.id,
                    platform 
                });

            if (disconnectError) {
                console.error(`[${timestamp}] Disconnect error:`, disconnectError);
                throw disconnectError;
            }

            console.log(`[${timestamp}] Successfully disconnected ${platform}`);

            // Sign out of the current session if it's the platform being disconnected
            try {
                await supabase.auth.signOut();
                console.log(`[${timestamp}] Signed out of current session`);
            } catch (signOutError) {
                console.error(`[${timestamp}] Sign out warning:`, signOutError);
            }

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