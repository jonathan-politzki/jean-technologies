// src/app/api/understand/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { OpenAI } from 'openai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 503 }
    );
  }

  try {
    const { userId, domain, query } = await request.json();
    
    // Create Supabase client directly
    const supabase = createRouteHandlerClient({ 
      cookies,
      options: {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      }
    });

    // Rest of your code...
    const { data: profiles } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profiles) {
      return NextResponse.json(
        { error: 'No social profile found' },
        { status: 404 }
      );
    }

    // Continue with the rest of your code...
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate understanding' },
      { status: 500 }
    );
  }
}