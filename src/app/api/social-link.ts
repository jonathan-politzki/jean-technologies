// src/app/api/social-link.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      const { userId, platform, profileUrl } = req.body;
  
      try {
        const { error } = await supabase
          .from('social_profiles')
          .insert({
            user_id: userId,
            platform,
            profile_url: profileUrl,
            added_at: new Date().toISOString()
          });
  
        if (error) throw error;
        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to store social link' });
      }
    }
  }
  