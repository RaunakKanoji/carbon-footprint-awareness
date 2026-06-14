import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (dbUser.profile?.onboardingComplete) {
    redirect('/dashboard');
  }

  return <OnboardingClient />;
}
