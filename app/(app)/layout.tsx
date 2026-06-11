import { auth } from '@clerk/nextjs/server';

import React from 'react';

import AppShell from '@/components/app/app-shell';
import OnboardingGuard from '@/components/app/onboarding-guard';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Protect all routes under (app) route group by redirecting signed-out visitors
  await auth.protect();

  return (
    <OnboardingGuard>
      <AppShell>{children}</AppShell>
    </OnboardingGuard>
  );
}
