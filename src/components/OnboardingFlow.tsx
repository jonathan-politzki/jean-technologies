// src/components/OnboardingFlow.tsx

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function OnboardingFlow() {
  const [socialUrl, setSocialUrl] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'twitter'>('instagram');

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSocialSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const response = await fetch('/api/social-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        platform,
        profileUrl: socialUrl
      })
    });

    if (response.ok) {
      // Handle success
      console.log('Social profile added!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full p-2 bg-white border rounded-lg flex items-center justify-center space-x-2"
        >
          <img src="/google-logo.svg" className="w-6 h-6" alt="Google" />
          <span>Continue with Google</span>
        </button>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Add your social profile</h3>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as 'instagram' | 'twitter')}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
          </select>
          <input
            type="url"
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
            placeholder="Enter your profile URL"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleSocialSubmit}
            className="w-full p-2 bg-blue-600 text-white rounded"
          >
            Add Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// Example of how to use the understand API (moved to documentation or separate file)
/*
async function getUnderstanding(userId: string) {
  const response = await fetch('/api/understand', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      userId,
      domain: 'shopping_preferences',
      query: 'What kind of fashion styles would this user prefer?'
    })
  });

  const { embedding, metadata } = await response.json();
  return { embedding, metadata };
}
*/
