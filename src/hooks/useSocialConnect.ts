// src/hooks/useSocialConnect.ts
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Platform, SocialProfile } from '@/lib/types';
import { handleError } from '@/utils/errors';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    // Create client without headers in options
    const supabase = createClientComponentClient();

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
            
            // Set headers in the query itself
            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id)
                .throwOnError();

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
                provider: 'linkedin_oidc', // Always use linkedin_oidc
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

    return {
        connectPlatform,
        getConnectedPlatforms,
        loading,
        error
    };
}