'use client';

import { createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>;

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new client for the provider
  const supabase = createClientComponentClient<Database>();
  
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}