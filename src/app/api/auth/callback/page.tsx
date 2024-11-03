'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) throw new Error('No code provided');

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        console.log('Auth successful:', data);
      } catch (error) {
        console.error('Auth error:', error);
      }

      // Redirect back to the main page
      router.replace('/');
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
}