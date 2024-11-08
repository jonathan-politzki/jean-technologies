// src/lib/supabase-singleton.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClientComponentClient<Database>>;

  private constructor() {}

  public static getInstance(): ReturnType<typeof createClientComponentClient<Database>> {
    if (!SupabaseClientSingleton.instance && typeof window !== 'undefined') {
      SupabaseClientSingleton.instance = createClientComponentClient<Database>();
    }
    return SupabaseClientSingleton.instance;
  }
}

export const getSupabaseClient = () => SupabaseClientSingleton.getInstance();