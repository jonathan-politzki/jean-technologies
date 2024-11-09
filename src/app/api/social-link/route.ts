// src/app/api/social-link/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { userId, platform, profileUrl } = await request.json();

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the requesting user matches the profile being created
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('social_profiles')
      .insert({
        user_id: userId,
        platform,
        profile_url: profileUrl,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Social link error:', error);
    return NextResponse.json(
      { error: 'Failed to store social link' },
      { status: 500 }
    );
  }
}