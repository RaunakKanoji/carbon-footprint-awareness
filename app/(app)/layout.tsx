import { auth } from '@clerk/nextjs/server';

import React from 'react';

import { AppShell, OnboardingGuard } from '@/src/app-shell';
import QueryProvider from '@/src/app-shell/query-provider';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();

  return (
    <QueryProvider>
      <OnboardingGuard>
        <AppShell>{children}</AppShell>
      </OnboardingGuard>
    </QueryProvider>
  );
}