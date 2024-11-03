import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, embedding, limit = 10 } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? ''
    )

    // Find similar embeddings using cosine similarity
    const { data: similarEmbeddings, error: similarError } = await supabaseClient.rpc(
      'match_embeddings',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit
      }
    )

    if (similarError) throw similarError

    // Get users and their labels
    const userIds = similarEmbeddings.map((e: any) => e.user_id)
    
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        semantic_labels (
          label,
          confidence
        )
      `)
      .in('id', userIds)

    if (usersError) throw usersError

    // Combine results
    const results = similarEmbeddings.map((e: any) => {
      const user = users.find((u: any) => u.id === e.user_id)
      return {
        userId: e.user_id,
        similarity: e.similarity,
        labels: user?.semantic_labels || []
      }
    })

    return new Response(
      JSON.stringify({ data: results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})