export interface User {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export type Platform = 'linkedin' | 'github' | 'google';
  
  export interface SocialProfile {
    id: string;
    user_id: string;
    platform: Platform;
    platform_user_id: string;
    access_token?: string;
    refresh_token?: string;
    profile_data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Embedding {
    id: string;
    user_id: string;
    source: string;
    embedding: number[];
    metadata: Record<string, any>;
    created_at: Date;
  }
  
  export interface SemanticLabel {
    id: string;
    user_id: string;
    label: string;
    confidence: number;
    source: string;
    created_at: Date;
  }
  
  export interface Understanding {
    embeddings: Embedding[];
    labels: SemanticLabel[];
    confidence: number;
  }
  
  // API Types
  export interface GenerateEmbeddingParams {
    userId: string;
    content: string;
    source: string;
    metadata?: Record<string, any>;
  }
  
  export interface UnderstandUserParams {
    userId: string;
    domain: string;
    query: string;
  }
  
  export interface FindSimilarParams {
    userId: string;
    embedding: number[];
    limit?: number;
  }
  
  // Error Types
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
  }