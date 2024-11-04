'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientComponent } from '@/lib/supabase/config';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = getClientComponent();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return <>{children}</>;
} 