import { useState, useCallback } from 'react';
import { useSupabase } from '../context/supabase';
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
            if (userError) throw userError;
            if (!user) return [];

            console.log(`[${timestamp}] Fetching profiles for user:`, user.id);

            const { data, error: profileError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (profileError) {
                console.error(`[${timestamp}] Profile fetch error:`, profileError);
                throw profileError;
            }

            console.log(`[${timestamp}] Found ${data?.length || 0} profiles`);
            return data as SocialProfile[] || [];

        } catch (err) {
            console.error(`[${timestamp}] Error:`, err);
            setError(handleError(err));
            return [];
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const connectPlatform = useCallback(async (platform: Platform) => {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[${timestamp}] Starting ${platform} connection`);
            setLoading(true);
            setError(null);

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        scope: 'openid profile email' + 
                            (platform === 'linkedin_oidc' ? ' w_member_social' : '')
                    }
                }
            });

            if (oauthError) throw oauthError;

        } catch (err) {
            console.error(`[${timestamp}] Connection error:`, err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    return {
        connectPlatform,
        getConnectedPlatforms,
        loading,
        error
    };
}