import { redirect } from 'next/navigation';

import DashboardClient from '@/src/features/dashboard/components/DashboardClient';
import { getDashboardData } from '@/src/server/dashboard/dashboard.service';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const dbUser = await getCurrentUser().catch((error) => {
    console.error('[dashboard] getCurrentUser failed:', error);
    throw error;
  });

  if (!dbUser) {
    redirect('/sign-in');
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
      throw error;
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
    throw error;
  });

  return <DashboardClient initialData={initialData} />;
}