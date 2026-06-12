import { SignUp } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center bg-bg-surface p-8 border border-border-default rounded-2xl shadow-xl">
        <div className="hidden md:flex flex-col gap-4 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">
            Carbon Compass AI
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed font-normal">
            Create an account to start tracking, predicting, and reducing your carbon footprint.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
