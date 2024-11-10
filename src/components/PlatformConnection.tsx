
'use client';

import { handleConnect } from '@/lib/supabase/server';
import { PLATFORMS_DATA } from './PlatformSelect';

export const PlatformConnection = ({ platform, isConnected }: { platform: typeof PLATFORMS_DATA[number], isConnected: boolean }) => {
  return (
    <button
      key={platform.id}
      onClick={async () => await handleConnect(platform.id, isConnected)}
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
}