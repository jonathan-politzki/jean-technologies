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

            // Use linkedin_oidc for LinkedIn
            const provider = platform === 'linkedin' ? 'linkedin_oidc' : platform;
            
            const options = {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: getPlatformScopes(platform),
                queryParams: {
                    prompt: 'consent'
                }
            };

            console.log(`[${timestamp}] OAuth configuration:`, {
                provider,
                redirectTo: options.redirectTo,
                scopes: options.scopes,
                queryParams: options.queryParams
            });

            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: provider as Provider,
                options
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
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Fetching connected platforms`);
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('social_profiles')
                .select('*');

            if (fetchError) throw fetchError;

            console.log(`[${timestamp}] Found platforms:`, {
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
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Disconnecting platform:`, platform);
            setLoading(true);
            setError(null);

            const { error: disconnectError } = await supabase
                .from('social_profiles')
                .delete()
                .eq('platform', platform);

            if (disconnectError) throw disconnectError;

            console.log(`[${timestamp}] Successfully disconnected:`, platform);
        } catch (err) {
            console.error('Disconnect error:', err);
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    };

    const getPlatformScopes = (platform: Platform): string => {
        const scopes: Record<Platform, string> = {
            linkedin: 'openid profile email',  // Updated LinkedIn scopes for OIDC
            google: 'profile email',
            github: 'read:user user:email'
        };
        
        const result = scopes[platform] || '';
        console.log(`Scopes for ${platform}:`, result);
        return result;
    };

    return {
        connectPlatform,
        getConnectedPlatforms,
        disconnectPlatform,
        loading,
        error
    };
}