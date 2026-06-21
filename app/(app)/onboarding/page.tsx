import { redirect } from 'next/navigation';

import OnboardingClient from '@/src/features/onboarding/components/OnboardingClient';
import { getCurrentUser } from '@/src/lib/auth';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const { preview } = await searchParams;
  const isPreview = process.env.NODE_ENV === 'development' && preview === '1';
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (dbUser.profile?.onboardingComplete && !isPreview) {
    redirect('/dashboard');
  }

  return <OnboardingClient />;
}
