// src/hooks/useSocialConnect.ts
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

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*')
                .eq('user_id', user.id);

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
            setLoading(true);
            setError(null);

            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: platform === 'linkedin_oidc' 
                    ? 'openid profile w_member_social email'
                    : 'profile email',
            };

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'linkedin_oidc',
                options
            });

            if (oauthError) throw oauthError;

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

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform)
                .eq('user_id', user.id);

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
        disconnectPlatform,  // Added this back
        loading,
        error
    };
}