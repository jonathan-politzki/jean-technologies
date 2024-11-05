// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// For client-side operations (singleton)
let clientInstance: ReturnType<typeof createClientComponentClient> | null = null;

export const getSupabase = () => {
    if (!clientInstance) {
        clientInstance = createClientComponentClient();
    }
    return clientInstance;
};