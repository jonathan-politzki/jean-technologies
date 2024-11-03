import OpenAI from 'openai';
import { GenerateEmbeddingParams } from './types';

if (!process.env.OPENAI_API_KEY && typeof window === 'undefined') {
  console.warn('Warning: OPENAI_API_KEY is not set. Some features may not work.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build-process',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

export async function generateSemanticLabels(text: string, domain: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a semantic labeling system. Given text and a domain, generate relevant semantic labels.
                 Return only a JSON array of strings representing the labels.`
      },
      {
        role: "user",
        content: `Text: "${text}"\nDomain: ${domain}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  const parsedResponse = JSON.parse(content) as { labels: string[] };
  return parsedResponse.labels;
}