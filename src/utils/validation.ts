import { z } from 'zod';
import { Platform } from '../lib/types';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const socialProfileSchema = z.object({
  platform: z.enum(['linkedin_oidc', 'github', 'google'] as const),
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

export const embeddingParamsSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1),
  source: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const understandingParamsSchema = z.object({
  userId: z.string().uuid(),
  domain: z.string(),
  query: z.string(),
});

export function validateEmbeddingParams(params: unknown) {
  return embeddingParamsSchema.parse(params);
}

export function validateUnderstandingParams(params: unknown) {
  return understandingParamsSchema.parse(params);
}

export function validateSocialProfile(params: unknown) {
  return socialProfileSchema.parse(params);
}

