import { redirect } from 'next/navigation';

import { prisma } from '@/src/db/prisma';
import SimulatorClient from '@/src/features/simulator/components/SimulatorClient';
import { getCurrentUser } from '@/src/lib/auth';

function getDateDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function SimulatorPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const factors = await prisma.emissionFactor.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      category: true,
      subType: true,
      unit: true,
      factor: true,
      region: true,
    },
  });

  const thirtyDaysAgo = getDateDaysAgo(30);

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: dbUser.id,
      occurredAt: {
        gte: thirtyDaysAgo,
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
      note: true,
      occurredAt: true,
    },
  });

  const profile = dbUser.profile
    ? {
      city: dbUser.profile.city,
      state: dbUser.profile.state,
      country: dbUser.profile.country,
      householdSize: dbUser.profile.householdSize,
      dietType: dbUser.profile.dietType,
      commuteMode: dbUser.profile.commuteMode,
      commuteDistanceKm: dbUser.profile.commuteDistanceKm,
      electricityUsageKwh: dbUser.profile.electricityUsageKwh,
    }
    : null;

  return (
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <SimulatorClient
        initialLogs={logs.map((log) => ({
          id: log.id,
          category: log.category,
          subType: log.subType,
          quantity: log.quantity,
          unit: log.unit,
          co2eKg: log.co2eKg,
          note: log.note,
          occurredAt: log.occurredAt.toISOString(),
        }))}
        profile={profile}
        factors={factors.map((factor) => ({
          id: factor.id,
          category: factor.category,
          subType: factor.subType,
          unit: factor.unit,
          factor: factor.factor,
          region: factor.region,
        }))}
      />
    </div>
  );
}
