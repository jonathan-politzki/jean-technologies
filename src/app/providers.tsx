// src/app/providers.tsx
'use client';

import { createContext, useContext } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

const SupabaseContext = createContext<ReturnType<typeof getSupabaseClient> | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  
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