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
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Connecting platform:`, {
                platform,
                clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? 'configured' : 'missing',
                redirectUrl: `${window.location.origin}/auth/callback`
            });

            setLoading(true);
            setError(null);

            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: getPlatformScopes(platform),
                queryParams: platform === 'linkedin' ? {
                    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
                    response_type: 'code',
                    prompt: 'consent',
                } : undefined
            };

            console.log(`[${timestamp}] OAuth options:`, {
                scopes: options.scopes,
                hasQueryParams: !!options.queryParams
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: platform as Provider,
                options
            });

            console.log(`[${timestamp}] OAuth response:`, {
                success: !error,
                hasData: !!data,
                url: data?.url,
                error: error?.message
            });

            if (error) throw error;

        } catch (err) {
            const timestamp = new Date().toISOString();
            console.error(`[${timestamp}] Connection error:`, {
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined
            });
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getPlatformScopes = (platform: Platform): string => {
        const scopes = {
            linkedin: 'openid profile email',  // Updated LinkedIn scopes
            google: 'profile email',
            github: 'read:user user:email'
        };
        
        const result = scopes[platform] || '';
        console.log(`Scopes for ${platform}:`, result);
        return result;
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