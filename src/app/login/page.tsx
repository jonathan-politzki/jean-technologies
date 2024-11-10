// src/app/page.tsx
import { LogInButton } from '@/components/AuthButtons';


export default async function SignIn() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
      <LogInButton provider="google" />
      <LogInButton provider="linkedin_oidc" />
    </div>
  );
}