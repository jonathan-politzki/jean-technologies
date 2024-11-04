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
            console.log(`[${new Date().toISOString()}] Connecting ${platform}`);
            setLoading(true);
            setError(null);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: platform as Provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: getPlatformScopes(platform),
                    queryParams: {
                        prompt: 'consent'
                    }
                }
            });

            console.log('OAuth response:', {
                success: !error,
                hasData: !!data,
                url: data?.url
            });

            if (error) throw error;

        } catch (err) {
            console.error('Connection error:', {
                message: err instanceof Error ? err.message : 'Unknown error'
            });
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
        try {
            console.log('Fetching connected platforms');
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('social_profiles')
                .select('*');

            if (error) throw error;
            
            console.log('Connected platforms:', {
                count: data?.length
            });
            
            return data || [];
        } catch (err) {
            console.error('Get platforms error:', err);
            setError(handleError(err));
            return [];
        } finally {
            setLoading(false);
        }
    };

    const disconnectPlatform = async (platform: Platform): Promise<void> => {
        try {
            console.log(`Disconnecting platform: ${platform}`);
            setLoading(true);
            setError(null);

            const { error } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (error) throw error;
            
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

function getPlatformScopes(platform: Platform): string {
    const scopes = {
        linkedin: 'openid profile w_member_social email',
        google: 'profile email',
        github: 'read:user user:email'
    };
    
    const result = scopes[platform] || '';
    console.log(`Scopes for ${platform}:`, result);
    return result;
}