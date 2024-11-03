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
      setLoading(true);
      setError(null);

      // Convert platform to Provider type that Supabase expects
      const provider = platform as Provider;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: getPlatformScopes(platform)
        }
      });

      if (error) throw error;

    } catch (err) {
      const error = handleError(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectedPlatforms = async (): Promise<SocialProfile[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('social_profiles')
        .select('*');

      if (error) throw error;

      return data;
    } catch (err) {
      const error = handleError(err);
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platform: Platform): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('social_profiles')
        .delete()
        .eq('platform', platform);

      if (error) throw error;

    } catch (err) {
      const error = handleError(err);
      setError(error);
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
  switch (platform) {
    case 'linkedin':
      return 'r_liteprofile r_emailaddress';
    case 'github':
      return 'read:user user:email';
    case 'google':
      return 'profile email';
    default:
      return '';
  }
}