import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { corsHeaders } from '../_shared/cors.ts'

// Add helper function at the top
async function processLinkedInContext(profileData: LinkedInProfile) {
  return {
    professional_context: {
      roles: profileData.positions.map(p => ({
        title: p.title,
        company: p.company,
        duration: `${p.startDate} - ${p.endDate || 'present'}`
      })),
      skills: profileData.skills.map(s => ({
        name: s.name,
        endorsements: s.endorsementCount
      })),
      name: `${profileData.firstName} ${profileData.lastName}`,
      email: profileData.email
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, domain, query } = await req.json()

    // Initialize clients
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? ''
    )

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    )

    // Get user's social profiles
    const { data: profiles, error: profileError } = await supabaseClient
      .from('social_profiles')
      .select('profile_data')
      .eq('user_id', userId)

    if (profileError) throw profileError

    // Combine profile data
    const context = await Promise.all(profiles.map(async p => {
      const data = p.profile_data;
      switch (p.platform) {
        case 'linkedin_oidc':
          return processLinkedInContext(data);
        default:
          return JSON.stringify(data);
      }
    }));

    const combinedContext = context
      .filter(Boolean)
      .map(c => JSON.stringify(c))
      .join('\n');

    // Generate embedding for the combined context
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-3-large',
      input: combinedContext,
    })

    const [{ embedding }] = embeddingResponse.data.data

    // Generate semantic labels
    const labelResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a semantic labeling system. Given user data and a domain, generate relevant semantic labels.
                   Return only a JSON array of {label: string, confidence: number} objects.`
        },
        {
          role: 'user',
          content: `User Data: ${combinedContext}\nDomain: ${domain}\nQuery: ${query}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const labels = JSON.parse(labelResponse.data.choices[0].message.content).labels

    // Store embedding and labels
    const { data: embeddingData, error: embeddingError } = await supabaseClient
      .from('embeddings')
      .insert({
        user_id: userId,
        source: 'understanding',
        embedding,
        metadata: { domain, query }
      })
      .select()
      .single()

    if (embeddingError) throw embeddingError

    const { error: labelsError } = await supabaseClient
      .from('semantic_labels')
      .insert(
        labels.map((l: any) => ({
          user_id: userId,
          label: l.label,
          confidence: l.confidence,
          source: 'understanding'
        }))
      )

    if (labelsError) throw labelsError

    return new Response(
      JSON.stringify({
        embeddings: [embeddingData],
        labels,
        confidence: Math.min(...labels.map((l: any) => l.confidence))
      }),
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