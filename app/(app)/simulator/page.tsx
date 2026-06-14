import React from 'react';

import { redirect } from 'next/navigation';

import PageHeader from '@/components/app/page-header';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

import SimulatorClient from './SimulatorClient';

export default async function SimulatorPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  // Fetch active emission factors from the database
  const factors = await prisma.emissionFactor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      category: true,
      subType: true,
      unit: true,
      factor: true,
      region: true,
    },
  });

  const serializedFactors = factors.map((f) => ({
    id: f.id,
    category: f.category,
    subType: f.subType,
    unit: f.unit,
    factor: f.factor,
    region: f.region,
  }));

  // Fetch the user's activity logs for the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
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

  const serializedLogs = logs.map((log) => ({
    id: log.id,
    category: log.category,
    subType: log.subType,
    quantity: log.quantity,
    unit: log.unit,
    co2eKg: log.co2eKg,
    note: log.note,
    occurredAt: log.occurredAt.toISOString(),
  }));

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
      <PageHeader
        title="Lifestyle Change Simulator"
        description="Model hypothetical choices in transport, diet, energy, shopping, and waste to see your potential CO₂e offset."
      />
      <SimulatorClient initialLogs={serializedLogs} profile={profile} factors={serializedFactors} />
    </div>
  );
}
