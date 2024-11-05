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

            // Query social profiles with explicit column selection
            console.log(`[${timestamp}] Querying social profiles for user:`, user.id);
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
    
            // Define base options
            const baseOptions = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin_oidc' 
                    ? 'openid profile email' // Simplified LinkedIn scopes
                    : 'profile email',
            };
    
            // Define platform-specific options
            const options = platform === 'linkedin_oidc' 
                ? {
                    ...baseOptions,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                        // Add any LinkedIn-specific parameters here
                    }
                }
                : {
                    ...baseOptions,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                };
    
            console.log(`[${timestamp}] Initiating OAuth with options:`, {
                platform,
                redirectTo: options.redirectTo,
                scopes: options.scopes,
                queryParams: options.queryParams
            });
    
            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform,
                options
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

            // Optionally revoke OAuth access
            if (platform === 'linkedin_oidc') {
                try {
                    await supabase.auth.signOut({ scope: 'linkedin_oidc' });
                } catch (signOutError) {
                    console.error(`[${timestamp}] OAuth revoke warning:`, signOutError);
                }
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