import React from 'react';

import { redirect } from 'next/navigation';

import LogClient from '@/app/(app)/log/LogClient';
import PageHeader from '@/components/app/page-header';
import { getCurrentUser } from '@/src/lib/auth';

export default async function LogActivityPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  // Generate today's date in local ISO date format (YYYY-MM-DD) for server side initial forms hydration
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Log Activity"
        description="Record your daily travels, food choices, household electricity consumption, purchases, and waste."
        badge="Live Tracking"
      />

      <LogClient todayStr={todayStr} />
    </div>
  );
}
