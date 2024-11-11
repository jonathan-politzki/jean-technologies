import { Platform } from '../lib/types';
import { PlatformConnection } from './PlatformConnection';

interface Props {
  connectedPlatforms: string[];
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
      description: 'Connect your Google account',

    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '💻',
      description: 'Connect your GitHub profile'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '🔗',
      description: 'Connect your professional profile'
    }
  ]

export function PlatformSelect({ connectedPlatforms }: Props) {
  return (
    <div className="space-y-4">
      {PLATFORMS_DATA.map(platformData => {
        console.log(connectedPlatforms);
        const isConnected = connectedPlatforms.some(url => url.includes(platformData.id))
        console.log(isConnected, platformData.id);

        return (
          <PlatformConnection
            key={platformData.id}
            platform={platformData}
            isConnected={isConnected}
          />
        );
      })}
    </div>
  );
}