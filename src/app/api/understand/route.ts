import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OpenAI } from 'openai';
import { getRouteHandler } from '@/lib/supabase/config';

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
    const cookieStore = cookies();
    const supabase = getRouteHandler(() => cookieStore);

    // 1. Get user's social data
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

    // 2. Generate embedding from social context
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: `User Profile URL: ${profiles.profile_url}\nQuery: ${query}\nDomain: ${domain}`
    });

    // 3. Store embedding
    const { data: storedEmbedding, error: storageError } = await supabase
      .from('embeddings')
      .insert({
        user_id: userId,
        domain,
        embedding: embedding.data[0].embedding,
        metadata: {
          query,
          confidence: 0.85,
          generated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (storageError) throw storageError;

    return NextResponse.json({
      embedding: embedding.data[0].embedding,
      metadata: storedEmbedding.metadata
    });

  } catch (error) {
    console.error('Understanding generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate understanding' },
      { status: 500 }
    );
  }
}