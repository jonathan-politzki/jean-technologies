// src/hooks/useSocialConnect.ts
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
            setLoading(true);
            setError(null);

            console.log(`[${timestamp}] Initiating ${platform} connection`);

            // Define base options type that matches Supabase's expected structure
            const baseOptions: {
                redirectTo: string;
                scopes: string;
                queryParams?: Record<string, string>;
            } = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: getPlatformScopes(platform)
            };

            // Add LinkedIn-specific options
            if (platform === 'linkedin') {
                baseOptions.queryParams = {
                    response_type: 'code',
                    prompt: 'consent'
                };
            }

            console.log(`[${timestamp}] OAuth configuration:`, {
                provider: platform,
                redirectTo: baseOptions.redirectTo,
                scopes: baseOptions.scopes,
                hasQueryParams: !!baseOptions.queryParams
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: platform as Provider,
                options: baseOptions
            });

            if (oauthError) {
                console.error(`[${timestamp}] OAuth error:`, {
                    code: oauthError.code,
                    message: oauthError.message,
                    status: oauthError.status
                });
                throw oauthError;
            }

            console.log(`[${timestamp}] OAuth success:`, {
                hasData: !!data,
                url: data?.url ? 'provided' : 'missing'
            });

        } catch (err) {
            console.error('Connection error:', err);
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

            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*');

            if (fetchError) throw fetchError;

            console.log('Found platforms:', {
                count: data?.length || 0,
                platforms: data?.map(p => p.platform) || []
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
            console.log('Disconnecting platform:', platform);
            setLoading(true);
            setError(null);

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (disconnectError) throw disconnectError;

            console.log('Successfully disconnected:', platform);
        } catch (err) {
            console.error('Disconnect error:', err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getPlatformScopes = (platform: Platform): string => {
        const scopes: Record<Platform, string> = {
            linkedin: 'openid profile w_member_social email',
            google: 'profile email',
            github: 'read:user user:email'
        };
        return scopes[platform] || '';
    };

    return {
        connectPlatform,
        getConnectedPlatforms,
        disconnectPlatform,
        loading,
        error
    };
}