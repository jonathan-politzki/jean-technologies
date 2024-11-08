// src/app/providers.tsx
'use client';

import { createContext, useContext, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase-singleton';
import type { Database } from '@/lib/database.types';

const SupabaseContext = createContext<ReturnType<typeof getSupabaseClient> | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  
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