// src/app/api/social-link/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';  // Using the server-side client

export async function POST(request: Request) {
  try {
    const { userId, platform, profileUrl } = await request.json();

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