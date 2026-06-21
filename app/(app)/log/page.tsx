// import React from 'react';
// import { redirect } from 'next/navigation';
// import LogClient from '@/app/(app)/log/LogClient';
// import PageHeader from '@/src/app-shell/page-header';
// import { getCurrentUser } from '@/src/lib/auth';
// export default async function LogActivityPage() {
//   const dbUser = await getCurrentUser();
//   if (!dbUser) {
//     redirect('/');
//   }
//   if (!dbUser.profile?.onboardingComplete) {
//     redirect('/onboarding');
//   }
//   // Generate today's date in local ISO date format (YYYY-MM-DD) for server side initial forms hydration
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const day = String(today.getDate()).padStart(2, '0');
//   const todayStr = `${year}-${month}-${day}`;
//   return (
//     <div className="space-y-4 w-full flex flex-col h-full overflow-visible min-h-0">
//       <PageHeader
//         title="Log Activity"
//         description="Record your daily travels, food choices, household electricity consumption, purchases, and waste."
//         badge="Live Tracking"
//       />
//       <LogClient todayStr={todayStr} />
//     </div>
//   );
// }
import { redirect } from 'next/navigation';

import { prisma } from '@/src/db/prisma';
import LogClient from '@/src/features/activity-logging/components/LogClient';
import type { RecentActivityLogItem } from '@/src/features/activity-logging/components/RecentActivityLogs';
import { ActivityCategory } from '@/src/lib/activity-types';
import { getCurrentUser } from '@/src/lib/auth';

const categoryMap: Record<string, ActivityCategory> = {
  food: ActivityCategory.Food,
  transport: ActivityCategory.Transport,
  shopping: ActivityCategory.Shopping,
  energy: ActivityCategory.Energy,
  waste: ActivityCategory.Waste,
};

export default async function LogActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const categoryKey = Array.isArray(category) ? category[0] : category;
  const initialCategory = categoryKey ? categoryMap[categoryKey] : ActivityCategory.Food;
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const recentActivityRows = await prisma.activityLog.findMany({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      occurredAt: 'desc',
    },
    take: 100,
    select: {
      id: true,
      category: true,
      subType: true,
      activityType: true,
      quantity: true,
      unit: true,
      co2eKg: true,
      provider: true,
      confidence: true,
      fallbackUsed: true,
      occurredAt: true,
      createdAt: true,
      note: true,
    },
  });

  const recentActivities: RecentActivityLogItem[] = recentActivityRows.map((activity) => ({
    id: activity.id,
    category: activity.category,
    subType: activity.subType,
    activityType: activity.activityType || null,
    quantity: activity.quantity,
    unit: activity.unit,
    co2eKg: activity.co2eKg,
    provider: activity.provider,
    confidence: activity.confidence,
    fallbackUsed: activity.fallbackUsed,
    occurredAt: activity.occurredAt.toISOString(),
    createdAt: activity.createdAt.toISOString(),
    note: activity.note,
  }));

  return (
    <LogClient
      todayStr={todayStr}
      recentActivities={recentActivities}
      initialCategory={initialCategory}
    />
  );
}
