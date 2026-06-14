import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  return <ProfileClient />;
}
