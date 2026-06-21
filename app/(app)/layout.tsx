import { auth } from '@clerk/nextjs/server';

import React from 'react';

import { AppShell, OnboardingGuard } from '@/src/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();

  return (
    <OnboardingGuard>
      <AppShell>{children}</AppShell>
    </OnboardingGuard>
  );
}
