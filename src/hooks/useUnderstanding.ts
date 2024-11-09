// src/hooks/useUnderstanding.ts
import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { Understanding, UnderstandUserParams } from '../lib/types';
import { handleError } from '../utils/errors';

export function useUnderstanding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabase();

  const generateUnderstanding = async (params: UnderstandUserParams): Promise<Understanding | null> => {
    try {
      setLoading(true);
      setError(null);

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify the requesting user matches the profile being analyzed
      if (user.id !== params.userId) {
        throw new Error('Unauthorized access');
      }

      const { data, error } = await supabase
        .functions.invoke('understand_user', {
          body: params
        });

      if (error) throw error;

      return data as Understanding;
    } catch (err) {
      const error = handleError(err);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const findSimilarUsers = async (userId: string, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify the requesting user matches
      if (user.id !== userId) {
        throw new Error('Unauthorized access');
      }

      const { data, error } = await supabase
        .functions.invoke('find_similar', {
          body: { userId, limit }
        });

      if (error) throw error;

      return data;
    } catch (err) {
      const error = handleError(err);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateUnderstanding,
    findSimilarUsers,
    loading,
    error
  };
}