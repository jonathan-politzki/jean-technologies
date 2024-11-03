'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [socialUrl, setSocialUrl] = useState('');
  const [platform, setPlatform] = useState('instagram');

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error:', error?.message);
      alert('Error signing in with Google');
    }
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_profiles')
        .insert([
          {
            user_id: user.id,
            platform,
            profile_url: socialUrl,
            added_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      alert('Profile added successfully!');
      setSocialUrl('');
    } catch (error) {
      console.error('Error:', error?.message);
      alert('Error saving profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-4xl font-bold text-center mb-8">Jean</h1>
        
        {!user ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Get Started
            </h2>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Add Social Profile</h2>
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile URL</label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}