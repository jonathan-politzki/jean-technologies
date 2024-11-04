// src/components/OAuthDebug.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function OAuthDebug() {
    const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkConfig = async () => {
      try {
        // Test Supabase Provider Configuration
        const { data: { providers } } = await supabase.auth.getSession();
        
        // Test environment configuration
        const configResponse = await fetch('/api/test-config');
        const configData = await configResponse.json();

        // Get deployment URL
        const currentUrl = window.location.origin;
        
        setConfig({
          supabaseUrl: configData.supabase?.url,
          currentDeploymentUrl: currentUrl,
          requiredCallbacks: [
            `${configData.supabase?.url}/auth/v1/callback`,
            `${currentUrl}/auth/callback`
          ],
          linkedinConfig: {
            clientIdConfigured: !!configData.linkedin?.clientId,
            clientSecretConfigured: !!configData.linkedin?.clientSecret,
            provider: configData.supabase?.provider
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check configuration');
      }
    };

    checkConfig();
  }, []);

  if (error) return <div className="p-4 bg-red-100 text-red-700">Error: {error}</div>;
  if (!config) return <div>Loading configuration...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">OAuth Configuration Debug</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Required Callback URLs</h3>
        <p className="text-sm text-gray-600">Add both of these to LinkedIn Developer Console:</p>
        {config.requiredCallbacks.map((url: string, i: number) => (
          <div key={i} className="p-2 bg-gray-100 rounded font-mono text-sm">
            {url}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Configuration Status</h3>
        <ul className="list-disc pl-5">
          <li className={config.linkedinConfig.clientIdConfigured ? 'text-green-600' : 'text-red-600'}>
            Client ID: {config.linkedinConfig.clientIdConfigured ? 'Configured' : 'Missing'}
          </li>
          <li className={config.linkedinConfig.clientSecretConfigured ? 'text-green-600' : 'text-red-600'}>
            Client Secret: {config.linkedinConfig.clientSecretConfigured ? 'Configured' : 'Missing'}
          </li>
          <li className={config.linkedinConfig.provider ? 'text-green-600' : 'text-red-600'}>
            Supabase Provider: {config.linkedinConfig.provider ? 'Enabled' : 'Not enabled'}
          </li>
        </ul>
      </div>
    </div>
  );
}