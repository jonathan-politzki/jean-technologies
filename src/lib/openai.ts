import OpenAI from 'openai';
import { GenerateEmbeddingParams } from './types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

export async function generateSemanticLabels(text: string, domain: string): Promise<string[]> {
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
    response_format: { type: "json_object" },
  });

  const labels = JSON.parse(response.choices[0].message.content).labels;
  return labels;
}