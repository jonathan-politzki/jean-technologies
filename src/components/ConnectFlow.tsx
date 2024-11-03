import { useState, useEffect } from 'react';
import { Platform, SocialProfile } from '../lib/types';
import { useSocialConnect } from '../hooks/useSocialConnect';
import { PlatformSelect } from './PlatformSelect';
import { UserInsights } from './UserInsights';

interface Props {
  userId: string;
  onComplete?: () => void;
}

export function ConnectFlow({ userId, onComplete }: Props) {
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialProfile[]>([]);
  const { connectPlatform, getConnectedPlatforms, disconnectPlatform, loading, error } = useSocialConnect();

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    const platforms = await getConnectedPlatforms();
    setConnectedPlatforms(platforms);
  };

  const handleConnect = async (platform: Platform) => {
    await connectPlatform(platform);
    await loadConnectedPlatforms();
    onComplete?.();
  };

  const handleDisconnect = async (platform: Platform) => {
    await disconnectPlatform(platform);
    await loadConnectedPlatforms();
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