// src/app/page.tsx
import { Provider, Session, User } from '@supabase/supabase-js';
import { redirect, useRouter } from 'next/navigation';
import { createClient, getUserProfiles } from '@/lib/supabase/server';
import { handleSignIn, handleSignOut } from '@/utils/auth/actions';
import ConnectFlow from '@/components/ConnectFlow';



export default async function Home() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    redirect('/login');
  }

  const socialProfiles = await getUserProfiles(user);
 


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">

      {user ? (
        <div className="space-y-6 w-full max-w-md">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
            <p className="text-gray-600">{user.email}</p>

            {socialProfiles ?
              <ConnectFlow
                socialProfiles={socialProfiles} /> :
              (
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    Complete your profile by connecting a social account
                  </p>
                </div>
              )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => handleSignIn('google')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            </svg>
            Sign in with Google
          </button>
          <button
            onClick={() => handleSignIn('linkedin_oidc')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            </svg>
            Sign in with LinkedIn
          </button>
        </>
      )}
    </div>
  );
}