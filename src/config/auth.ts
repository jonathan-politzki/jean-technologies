export const GOOGLE_CONFIG = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
};

export const LINKEDIN_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  scope: 'openid profile email', // Changed to string
  redirectUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
};