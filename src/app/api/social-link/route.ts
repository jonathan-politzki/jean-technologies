// src/app/api/social-link/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, platform, profileUrl } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase
      .from('social_profiles')
      .insert({
        user_id: userId,
        platform,
        profile_url: profileUrl,
        added_at: new Date().toISOString()
      });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store social link' },
      { status: 500 }
    );
  }
}