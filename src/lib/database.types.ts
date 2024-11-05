export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_profiles: {
        Row: {
          id: string
          user_id: string
          platform: 'google' | 'github' | 'linkedin_oidc'
          platform_user_id: string
          access_token: string | null
          refresh_token: string | null
          profile_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'google' | 'github' | 'linkedin_oidc'
          platform_user_id: string
          access_token?: string | null
          refresh_token?: string | null
          profile_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'google' | 'github' | 'linkedin_oidc'
          platform_user_id?: string
          access_token?: string | null
          refresh_token?: string | null
          profile_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      embeddings: {
        Row: {
          id: string
          user_id: string
          source: string
          embedding: number[]
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: string
          embedding: number[]
          metadata: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: string
          embedding?: number[]
          metadata?: Json
          created_at?: string
        }
      }
      semantic_labels: {
        Row: {
          id: string
          user_id: string
          label: string
          confidence: number
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          confidence: number
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          confidence?: number
          source?: string
          created_at?: string
        }
      }
    }
    Functions: {
      match_embeddings: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          user_id: string
          similarity: number
        }[]
      }
    }
  }
}