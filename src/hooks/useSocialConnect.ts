import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Platform, SocialProfile } from '@/lib/types';
import { handleError } from '@/utils/errors';

export function useSocialConnect() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClientComponentClient();

    const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
        try {
            console.log('Fetching connected platforms');
            setLoading(true);
            setError(null);
    
            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*');
    
            if (fetchError) throw fetchError;
    
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
            console.log(`Starting ${platform} connection`);
            setLoading(true);
            setError(null);

            // Modified LinkedIn specific configuration
            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin' ? 'r_liteprofile r_emailaddress' : 'profile email',
            };

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform,
                options
            });

            if (oauthError) {
                console.error('OAuth error:', oauthError);
                throw oauthError;
            }

            console.log('OAuth success:', data);

        } catch (err) {
            console.error('Connection error:', err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const disconnectPlatform = async (platform: Platform): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (disconnectError) throw disconnectError;

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