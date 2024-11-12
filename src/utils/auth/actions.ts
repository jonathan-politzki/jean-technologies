"use server"

import { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/config";

export const handleSignIn = async (provider: Provider) => {

    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${getBaseUrl()}/auth/callback` // Must match route exactly
      }
    });

    if (error) {
      console.error('Sign in error:', error);
    } 

    console.log('data', getBaseUrl(), process.env.VERCEL_ENV);

    if (data.url) {
      redirect(data.url)
    }

  };


  export const handleSignOut = async () => {

    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  