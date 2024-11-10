import { Platform } from '../lib/types';
import { PlatformConnection } from './PlatformConnection';

interface Props {
  connectedPlatforms: Platform[];
}

export const PLATFORMS_DATA: {
  id: Platform;
  name: string;
  icon: string;
  description: string;
}[] = [
    {
      id: 'google',
      name: 'Google',
      icon: '🌐',
      description: 'Connect your Google account'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '💻',
      description: 'Connect your GitHub profile'
    },
    {
      id: 'linkedin_oidc',
      name: 'LinkedIn',
      icon: '🔗',
      description: 'Connect your professional profile'
    }
  ]

export function PlatformSelect({ connectedPlatforms }: Props) {
  return (
    <div className="space-y-4">
      {PLATFORMS_DATA.map(platform => {
        const isConnected = connectedPlatforms.includes(platform.id);

        return (
          <PlatformConnection
            key={platform.id}
            platform={platform}
            isConnected={isConnected}
          />
        );
      })}
    </div>
  );
}