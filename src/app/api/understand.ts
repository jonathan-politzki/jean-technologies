// src/pages/api/understand.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, domain, query } = req.body;

    try {
      // 1. Get user's social data
      const { data: profiles } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profiles) {
        return res.status(404).json({ error: 'No social profile found' });
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
            confidence: 0.85, // Placeholder for now
            generated_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (storageError) throw storageError;

      return res.status(200).json({
        embedding: embedding.data[0].embedding,
        metadata: storedEmbedding.metadata
      });

    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate understanding' });
    }
  }
}
