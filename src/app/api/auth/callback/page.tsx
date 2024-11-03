'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next') || '/';

        if (!code) {
          throw new Error('No authorization code provided');
        }

        // Exchange code for session
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          throw sessionError;
        }

        if (!data?.session) {
          throw new Error('No session data received');
        }

        // Check if user profile exists, create if it doesn't
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select()
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw insertError;
          }
        }

        // Redirect to the intended destination
        router.replace(next);
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to login page after a delay if there's an error
        setTimeout(() => {
          router.replace('/login?error=auth_callback_failed');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
          <div className="text-center text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-xl font-semibold">Authentication Error</h2>
            <p className="mt-2 text-sm">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Completing Sign In</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we finish setting up your account...</p>
      </div>
    </div>
  );
}