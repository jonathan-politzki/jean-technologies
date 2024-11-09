// src/components/ConnectFlow.tsx
'use client';

import { useState, useEffect } from 'react';
import { Platform, SocialProfile } from '../lib/types';
import { useSocialConnect } from '../hooks/useSocialConnect';
import { PlatformSelect } from './PlatformSelect';
import { UserInsights } from './UserInsights';

interface Props {
  userId: string;
  existingProfile: SocialProfile | null;
  onProfileUpdate: (profile: SocialProfile | null) => void;
}

export default function ConnectFlow({ userId, existingProfile, onProfileUpdate }: Props) {
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialProfile[]>([]);
  const { connectPlatform, getConnectedPlatforms, disconnectPlatform, loading, error } = useSocialConnect();

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      const platforms = await getConnectedPlatforms();
      setConnectedPlatforms(platforms);
      onProfileUpdate(platforms[0] || null);
    } catch (err) {
      console.error('Error loading platforms:', err);
    }
  };

  const handleConnect = async (platform: Platform) => {
    try {
      console.log(`Initiating ${platform} connection`);
      await connectPlatform(platform);
      console.log('Connection successful, reloading platforms');
      await loadConnectedPlatforms();
    } catch (err) {
      console.error(`${platform} connection error:`, err);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      console.log(`Disconnecting ${platform}`);
      await disconnectPlatform(platform);
      console.log('Disconnection successful, reloading platforms');
      await loadConnectedPlatforms();
    } catch (err) {
      console.error(`${platform} disconnection error:`, err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Connect Your Accounts</h2>
      
      <PlatformSelect
        connectedPlatforms={connectedPlatforms.map(p => p.platform)}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {connectedPlatforms.length > 0 && (
        <div className="mt-8">
          <UserInsights userId={userId} />
        </div>
      )}
    </div>
  );
}