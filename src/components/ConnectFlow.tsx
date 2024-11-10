import { Platform, SocialProfile } from '../lib/types';
import { PlatformSelect } from './PlatformSelect';
import { UserInsights } from './UserInsights';


export default function ConnectFlow({ socialProfiles }: { socialProfiles: SocialProfile[] }) {


  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Connect Your Accounts</h2>

      
      <PlatformSelect
        connectedPlatforms={socialProfiles.map(p => p.platform as Platform)}
      />

      {socialProfiles.length > 0 && (
        <div className="mt-8">
          <UserInsights userId={socialProfiles[0].user_id} />
        </div>
      )}
    </div>
  );
}