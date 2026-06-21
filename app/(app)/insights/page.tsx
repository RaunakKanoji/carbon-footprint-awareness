import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { prisma } from '@/src/db/prisma';
import InsightsClient from '@/src/features/insights/components/InsightsClient';
import { getCurrentUser } from '@/src/lib/auth';

function getDateDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function InsightsPage() {
  await connection();

  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const oneYearAgo = getDateDaysAgo(365);

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: dbUser.id,
      occurredAt: {
        gte: oneYearAgo,
      },
    },
    orderBy: {
      occurredAt: 'desc',
    },
    select: {
      id: true,
      category: true,
      subType: true,
      quantity: true,
      unit: true,
      co2eKg: true,
      occurredAt: true,
    },
  });

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
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <InsightsClient initialLogs={serializedLogs} />
    </div>
  );
}
