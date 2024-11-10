export const GOOGLE_CONFIG = {
  provider: 'google',
  options: {
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  }
};

export const LINKEDIN_CONFIG = {
  provider: 'linkedin_oidc',
  options: {
    scopes: ['openid', 'profile', 'email'],
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  }
};