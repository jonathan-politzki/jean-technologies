// src/app/api/social-link/linkedin/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { LinkedInClient } from '@/lib/linkedin';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Initialize LinkedIn client
    const linkedinClient = new LinkedInClient(accessToken);
    
    // Fetch profile data
    const [profile, positions, skills] = await Promise.all([
      linkedinClient.getProfile(),
      linkedinClient.getPositions(),
      linkedinClient.getSkills()
    ]);

    // Store in social_profiles
    const { error } = await supabase
      .from('social_profiles')
      .upsert({
        user_id: user.id,
        platform: 'linkedin',
        platform_user_id: profile.id,
        access_token: accessToken,
        profile_data: {
          profile,
          positions,
          skills
        },
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LinkedIn profile storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store LinkedIn profile' },
      { status: 500 }
    );
  }
}