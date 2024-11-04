import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Platform, SocialProfile } from '../lib/types';
import { handleError } from '../utils/errors';
import { Provider } from '@supabase/supabase-js';

export function useSocialConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connectPlatform = async (platform: Platform): Promise<void> => {
    try {
      console.log(`[${new Date().toISOString()}] Starting ${platform} connection`);
      setLoading(true);
      setError(null);

      // Convert platform to Provider type
      const provider = platform as Provider;
      const scopes = getPlatformScopes(platform);
      
      console.log('Connection details:', { 
        platform, 
        provider, 
        scopes,
        redirectUrl: `${window.location.origin}/auth/callback`
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes,
          queryParams: {
            prompt: 'consent', // Force consent screen
            access_type: 'offline' // Request refresh token
          }
        }
      });

      console.log('OAuth response:', { 
        success: !error,
        hasData: !!data,
        error: error?.message,
        url: data?.url
      });

      if (error) {
        console.error('OAuth error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

    } catch (err) {
      console.error('Connection error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      const error = handleError(err);
      setError(error);
    } finally {
      setLoading(false);
      console.log(`[${new Date().toISOString()}] Connection attempt completed`);
    }
  };

  function getPlatformScopes(platform: Platform): string {
    const scopes = {
      linkedin: 'openid profile w_member_social email',
      github: 'read:user user:email',
      google: 'profile email'
    };
    
    const result = scopes[platform] || '';
    console.log(`Scopes for ${platform}:`, result);
    return result;
  }

  const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
    try {
      console.log('Fetching connected platforms');
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('social_profiles')
        .select('*');

      console.log('Connected platforms response:', {
        success: !error,
        count: data?.length,
        error: error?.message
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Get platforms error:', err);
      const error = handleError(err);
      setError(error);
      return [];
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