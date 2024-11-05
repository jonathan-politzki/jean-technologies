export type Database = {
    public: {
      Tables: {
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
      }
    }
  }
  
  export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]