import Link from 'next/link';
import { redirect } from 'next/navigation';

import DashboardClient from '@/src/features/dashboard/components/DashboardClient';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { getDashboardData } from '@/src/server/dashboard/dashboard.service';
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

function DashboardServerError({
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
            Dashboard Setup
          </p>

          <CardTitle className="text-2xl font-black tracking-tight text-text-primary">
            {title}
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-text-secondary">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Link href="/onboarding" className={cn(buttonVariants(), 'rounded-full')}>
            Go to onboarding
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

export default async function DashboardPage() {
  const dbUser = await getCurrentUser().catch((error) => {
    console.error('[dashboard] getCurrentUser failed:', error);
    return null;
  });

  if (!dbUser) {
    return (
      <DashboardServerError
        title="We could not load your account."
        description="Your Clerk session is active, but Carbon Compass could not load or create your database user. Check CLERK_SECRET_KEY, DATABASE_URL, and Vercel Function Logs."
      />
    );
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  if (!dbUser.carbonProfile) {
    redirect('/footprint');
  }

  const hasBudget = await prisma.budget
    .findFirst({
      where: { userId: dbUser.id },
      select: { id: true },
    })
    .catch((error) => {
      console.error('[dashboard] budget lookup failed:', {
        userId: dbUser.id,
        error,
      });

      return null;
    });

  if (!hasBudget) {
    redirect('/goals');
  }

  const initialData = await getDashboardData(dbUser.id, 'week').catch((error) => {
    console.error('[dashboard] getDashboardData failed:', {
      userId: dbUser.id,
      period: 'week',
      error,
    });

    return null;
  });

  if (!initialData) {
    return (
      <DashboardServerError
        title="We could not load your dashboard data."
        description="Your account loaded, but the dashboard database queries failed. Check that your deployed database has the latest Prisma migrations and tables."
      />
    );
  }

  return <DashboardClient initialData={initialData} />;
}