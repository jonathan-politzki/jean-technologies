'use server';

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database, Tables } from '@/lib/database.types'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Platform, Understanding, UnderstandUserParams } from '../types'
import { redirect } from 'next/navigation';



export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getUserProfiles(user: User) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from('social_profiles')
    .select(`
      id,
      user_id,
      platform,
      platform_user_id,
      access_token,
      refresh_token,
      profile_data,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)

  if (profileError) {
    console.error(profileError);
    return null;
  }
  return profile;
}

export async function disconnectPlatform(platform: Platform): Promise<void> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const { error: disconnectError } = await supabase
      .from('social_profiles')
      .delete()
      .match({ user_id: user.id, platform });

      if (disconnectError) throw disconnectError;

      // Sign out if disconnecting current platform
      await supabase.auth.signOut();

  } catch (err) {
    console.error(err);
  }
}

export async function connectPlatform(platform: Platform): Promise<void> {
  let url = '';
  try {
    const supabase = await createClient();

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: platform,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
          scopes: platform === 'linkedin_oidc' 
            ? 'openid profile email' 
            : 'profile email',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (oauthError) throw oauthError;

      if (data.url) {
        url = data.url;
      }

  } catch (err) {
    console.error(err);
  }
  if (url) {
    redirect(url);
  }
}

export async function handleConnect(platform: Platform, isConnected: boolean) {
  if (isConnected) {
      await disconnectPlatform(platform);
    } else {
      await connectPlatform(platform);
    }
  }

export async function generateUnderstanding(params: UnderstandUserParams): Promise<Understanding | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke('understand_user', {
        body: params
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
