// app/(app)/log/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/src/db/prisma';
import LogClient from '@/src/features/activity-logging/components/LogClient';
import type { RecentActivityLogItem } from '@/src/features/activity-logging/components/RecentActivityLogs';
import { ActivityCategory } from '@/src/lib/activity-types';
import { getCurrentUser } from '@/src/lib/auth';
import { buttonVariants } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const categoryMap: Record<string, ActivityCategory> = {
  food: ActivityCategory.Food,
  transport: ActivityCategory.Transport,
  shopping: ActivityCategory.Shopping,
  energy: ActivityCategory.Energy,
  waste: ActivityCategory.Waste,
};

function todayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function LogServerError({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-xl rounded-3xl border-border-default bg-bg-surface shadow-sm">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Log Setup
          </p>

          <CardTitle className="text-2xl font-black tracking-tight text-text-primary">
            {title}
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-text-secondary">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={cn(buttonVariants(), 'rounded-full')}>
            Back to dashboard
          </Link>

          <Link
            href="/profile"
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
          >
            Open profile
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

async function getRecentActivities(userId: string): Promise<RecentActivityLogItem[]> {
  try {
    const recentActivityRows = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          occurredAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
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

    return recentActivityRows.map((activity) => ({
      id: activity.id,
      category: String(activity.category),
      subType: activity.subType ?? activity.activityType ?? 'Activity',
      quantity: Number(activity.quantity ?? 0),
      unit: activity.unit ?? null,
      co2eKg: Number(activity.co2eKg ?? 0),
      provider: activity.provider ? String(activity.provider) : null,
      confidence: activity.confidence ? String(activity.confidence) : null,
      occurredAt: activity.occurredAt?.toISOString?.() ?? new Date().toISOString(),
      createdAt: activity.createdAt?.toISOString?.() ?? null,
      note: activity.note ?? null,
    }));
  } catch (error) {
    console.error('[log] recent activity lookup failed:', {
      userId,
      error,
    });

    return [];
  }
}

export default async function LogActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;

  const categoryKeyRaw = Array.isArray(category) ? category[0] : category;
  const categoryKey = categoryKeyRaw?.toLowerCase();

  const initialCategory =
    categoryKey && categoryMap[categoryKey] ? categoryMap[categoryKey] : ActivityCategory.Food;

  const dbUser = await getCurrentUser().catch((error) => {
    console.error('[log] getCurrentUser failed:', error);
    return null;
  });

  if (!dbUser) {
    return (
      <LogServerError
        title="We could not load your account."
        description="Your session is active, but Carbon Compass could not load or create your database user. Check Clerk keys, DATABASE_URL, and Vercel Function Logs."
      />
    );
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const recentActivities = await getRecentActivities(dbUser.id);

  return (
    <LogClient
      todayStr={todayIsoDate()}
      recentActivities={recentActivities}
      initialCategory={initialCategory}
    />
  );
}