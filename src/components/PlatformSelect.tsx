import { Platform } from '../lib/types';

interface Props {
  connectedPlatforms: Platform[];
  onConnect: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

const PLATFORMS: { 
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
];

export function PlatformSelect({ connectedPlatforms, onConnect, onDisconnect }: Props) {
  return (
    <div className="space-y-4">
      {PLATFORMS.map(platform => {
        const isConnected = connectedPlatforms.includes(platform.id);

        return (
          <button
            key={platform.id}
            onClick={() => isConnected ? onDisconnect(platform.id) : onConnect(platform.id)}
            className={`
              w-full flex items-center p-4 rounded-lg border-2 transition-colors
              ${isConnected 
                ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}
            `}
          >
            <span className="text-2xl mr-3">{platform.icon}</span>
            <span className="flex-1 text-left font-medium">{platform.name}</span>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Connect'}
            </span>
          </button>
        );
      })}
    </div>
  );
}