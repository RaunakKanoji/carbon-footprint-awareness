import React from 'react';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

import InsightsClient from './InsightsClient';

export default async function InsightsPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const userId = dbUser.id;
  const now = new Date();

  // Fetch logs for the last 365 days
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const logs = await prisma.activityLog.findMany({
    where: {
      userId,
      occurredAt: {
        gte: oneYearAgo,
      },
    },
    orderBy: { occurredAt: 'desc' },
  });

  // Serialize dates to ISO strings for client component safety
  const serializedLogs = logs.map((log) => ({
    id: log.id,
    category: log.category,
    subType: log.subType,
    quantity: log.quantity,
    unit: log.unit,
    co2eKg: log.co2eKg,
    occurredAt: log.occurredAt.toISOString(),
  }));

  return (
    <div className="space-y-6 w-full pb-8">
      <InsightsClient initialLogs={serializedLogs} />
    </div>
  );
}
