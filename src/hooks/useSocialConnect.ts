// src/hooks/useSocialConnect.ts
import { useState, useCallback } from 'react';
import { useSupabase } from '../app/providers';
import { Platform, SocialProfile } from '../lib/types';
import { handleError } from '../utils/errors';

export function useSocialConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabase();

  const getConnectedPlatforms = useCallback(async (): Promise<SocialProfile[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('social_profiles')
        .select(`
          id,
          user_id,
          platform,
          platform_user_id,
          access_token,
          refresh_token,
          profile_data,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      if (profileError) throw profileError;
      return profiles || [];

    } catch (err) {
      const error = handleError(err);
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const connectPlatform = useCallback(async (platform: Platform): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: platform,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: platform === 'linkedin_oidc' 
            ? 'openid profile email' 
            : 'profile email',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (oauthError) throw oauthError;

    } catch (err) {
      const error = handleError(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const disconnectPlatform = useCallback(async (platform: Platform): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { error: disconnectError } = await supabase
        .from('social_profiles')
        .delete()
        .match({ 
          user_id: user.id,
          platform 
        });

      if (disconnectError) throw disconnectError;

      // Sign out if disconnecting current platform
      await supabase.auth.signOut();

    } catch (err) {
      const error = handleError(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    loading,
    error,
    getConnectedPlatforms,
    connectPlatform,
    disconnectPlatform
  };
}