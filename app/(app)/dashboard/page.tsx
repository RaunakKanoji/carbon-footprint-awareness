import React from 'react';

import { redirect } from 'next/navigation';

import DashboardClient from '@/components/dashboard/DashboardClient';
import { getDashboardData } from '@/lib/dashboard';
import { getCurrentUser } from '@/src/lib/auth';

export default async function DashboardPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  // Single batched $transaction — replaces 8 sequential Prisma queries
  const data = await getDashboardData(dbUser.id);

  return (
    <DashboardClient
      todayFootprint={data.todayFootprint}
      weeklyFootprint={data.weeklyFootprint}
      monthlyBudget={data.monthlyBudget}
      monthlyConsumption={data.monthlyConsumption}
      remainingBudget={data.remainingBudget}
      trendPercentage={data.trendPercentage}
      weeklyLogs={data.weeklyLogs}
      categoryShare={data.categoryShare}
      recentActivities={data.recentActivities}
    />
  );
}
