import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Platform, SocialProfile } from '@/lib/types';
import { handleError } from '@/utils/errors';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClientComponentClient({
        options: {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    });

    const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
        try {
            console.log('Fetching connected platforms');
            setLoading(true);
            setError(null);

            // First get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('User fetch error:', userError);
                throw userError;
            }

            if (!user) {
                console.error('No user found');
                return [];
            }

            console.log('Fetching profiles for user:', user.id);
            
            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id);

            if (fetchError) {
                console.error('Profile fetch error:', fetchError);
                throw fetchError;
            }

            console.log('Fetched profiles:', data);
            return data || [];
            
        } catch (err) {
            console.error('Get platforms error:', err);
            setError(handleError(err));
            return [];
        } finally {
            setLoading(false);
        }
    };

    const connectPlatform = async (platform: Platform): Promise<void> => {
        try {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Starting ${platform} connection`);
            setLoading(true);
            setError(null);

            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin_oidc' 
                    ? 'openid profile w_member_social email'
                    : 'profile email',
            };

            console.log(`[${timestamp}] Initiating OAuth with:`, {
                provider: platform,
                redirectTo: options.redirectTo,
                scopes: options.scopes
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform,
                options
            });

            if (oauthError) {
                console.error(`[${timestamp}] OAuth error:`, oauthError);
                throw oauthError;
            }

            console.log(`[${timestamp}] OAuth success:`, {
                hasData: !!data,
                url: data?.url
            });

        } catch (err) {
            console.error('Connection error:', err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const disconnectPlatform = async (platform: Platform): Promise<void> => {
        try {
            console.log(`Starting disconnection of ${platform}`);
            setLoading(true);
            setError(null);

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (disconnectError) {
                console.error('Disconnect error:', disconnectError);
                throw disconnectError;
            }

            console.log(`Successfully disconnected ${platform}`);

        } catch (err) {
            console.error('Disconnect error:', err);
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