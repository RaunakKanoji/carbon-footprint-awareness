import { redirect } from 'next/navigation';

import DashboardClient from '@/src/features/dashboard/components/DashboardClient';
import { getDashboardData } from '@/src/server/dashboard/dashboard.service';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export default async function DashboardPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) redirect('/');
  if (!dbUser.profile?.onboardingComplete) redirect('/onboarding');
  if (!dbUser.carbonProfile) redirect('/footprint');

  const hasBudget = await prisma.budget.findFirst({
    where: { userId: dbUser.id },
    select: { id: true },
  });
  if (!hasBudget) redirect('/goals');

  const initialData = await getDashboardData(dbUser.id, 'week');

  return <DashboardClient initialData={initialData} />;
}
