'use client';

import { handleSignIn } from '@/utils/auth/actions';
import { Provider } from '@supabase/supabase-js';


export const LogInButton = ({ provider }: { provider: Provider }) => (
    
    <button
        onClick={() => handleSignIn(provider)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        </svg>
        Sign in with {provider.charAt(0).toUpperCase() + provider.replace('_oidc', '').slice(1)}
    </button>
)
