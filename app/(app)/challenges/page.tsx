import { redirect } from 'next/navigation';
import ChallengesPageClient from '@/src/features/challenges/components/ChallengesPageClient';
import { getCurrentUser } from '@/src/lib/auth';

export default async function ChallengesPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <ChallengesPageClient />
    </div>
  );
}
