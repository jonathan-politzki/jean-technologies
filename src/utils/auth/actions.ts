"use server"

import { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const handleSignIn = async (provider: Provider) => {

    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback` // Must match route exactly
      }
    });

    if (error) {
      console.error('Sign in error:', error);
    } 

    if (data.url) {
      redirect(data.url)
    }

  };


  export const handleSignOut = async () => {

    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  