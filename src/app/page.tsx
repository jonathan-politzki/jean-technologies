'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SocialProfile } from '@/lib/types';
import ConnectFlow from '@/components/ConnectFlow';
import { useSupabase } from '@/app/providers';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [socialProfile, setSocialProfile] = useState<SocialProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = useSupabase();
  
    useEffect(() => {
      const loadUserData = async () => {
        try {
          setLoading(true);
          
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          
          if (session?.user) {
            setUser(session.user);
            
            // Get social profile if it exists
            const { data: profile, error: profileError } = await supabase
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
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }
            
            setSocialProfile(profile);
          }
        } catch (err) {
          console.error('Failed to load user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      };

      // Load initial data
      loadUserData();

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setSocialProfile(null);
        }
        
        router.refresh();
      });

      return () => {
        subscription.unsubscribe();
      };
    }, [supabase, router]);

    const handleSignIn = async () => {
      try {
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
          
        if (signInError) throw signInError;
      } catch (err) {
        console.error('Sign in error:', err);
        setError('Failed to sign in');
      }
    };

    const handleSignOut = async () => {
      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        
        // Clear local state
        setUser(null);
        setSocialProfile(null);
      } catch (err) {
        console.error('Sign out error:', err);
        setError('Failed to sign out');
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {user ? (
          <div className="space-y-6 w-full max-w-md">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
              <p className="text-gray-600">{user.email}</p>
              
              {!socialProfile && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    Complete your profile by connecting a social account
                  </p>
                </div>
              )}
            </div>
            
            <ConnectFlow 
              userId={user.id} 
              existingProfile={socialProfile}
              onProfileUpdate={setSocialProfile}
            />

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    );
}