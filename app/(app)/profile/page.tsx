import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth';
import ProfilePageClient from '@/src/features/profile/components/ProfilePageClient';

export default async function ProfilePage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  return <ProfilePageClient />;
}
