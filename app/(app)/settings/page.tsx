import React from 'react';

import { redirect } from 'next/navigation';

import PageHeader from '@/components/app/page-header';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  // Fetch all monthly carbon budget records for this user
  const budgets = await prisma.budget.findMany({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      month: 'desc',
    },
  });

  // Serialize date objects to ISO strings for hydration safety in client props
  const serializedBudgets = budgets.map((b) => ({
    id: b.id,
    month: b.month.toISOString(),
    targetKg: b.targetKg,
  }));

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Settings"
        description="Configure application preferences, monthly carbon limits, and sustainability targets."
        badge="Budget Management"
      />
      <SettingsClient initialBudgets={serializedBudgets} />
    </div>
  );
}
