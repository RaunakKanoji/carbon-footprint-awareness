'use server';

import { auth } from '@clerk/nextjs/server';

import { CommuteMode, DietType } from '@/app/generated/prisma';
import { prisma } from '@/lib/prisma';
import { OnboardingInput, onboardingSchema } from '@/lib/validations/onboarding';
import { getCurrentUser } from '@/src/lib/auth';

export async function updateProfile(data: OnboardingInput) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error('Unauthorized');
  }

  // Validate the data
  const parsed = onboardingSchema.parse(data);

  // Ensure DB user and profile exist
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    throw new Error('User not found in database');
  }

  // Update user name in DB if provided
  if (parsed.name) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { name: parsed.name },
    });
  }

  // Map onboarding input enums to Prisma schema enums
  const dietMapping: Record<string, DietType> = {
    vegan: DietType.VEGAN,
    vegetarian: DietType.VEGETARIAN,
    pescatarian: DietType.PESCATARIAN,
    omnivore: DietType.OMNIVORE,
    mixed: DietType.MIXED,
    'heavy-meat': DietType.OTHER,
  };

  const commuteMapping: Record<string, CommuteMode> = {
    car: CommuteMode.CAR,
    motorcycle: CommuteMode.MOTORBIKE,
    'public-transit': CommuteMode.BUS,
    metro: CommuteMode.METRO,
    bicycle: CommuteMode.BICYCLE,
    walking: CommuteMode.WALK,
    remote: CommuteMode.WORK_FROM_HOME,
  };

  // Update profile database record
  await prisma.profile.update({
    where: { userId: dbUser.id },
    data: {
      city: parsed.city,
      state: parsed.state,
      country: parsed.country,
      householdSize: parsed.householdSize,
      dietType: dietMapping[parsed.dietType],
      commuteMode: commuteMapping[parsed.commuteMode],
      commuteDistanceKm: parsed.commuteDistance,
      electricityUsageKwh: parsed.monthlyKwh,
      onboardingComplete: true, // Keep it true
    },
  });

  // Upsert a monthly carbon budget record for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  await prisma.budget.upsert({
    where: {
      userId_month: {
        userId: dbUser.id,
        month: startOfMonth,
      },
    },
    update: {
      targetKg: parsed.monthlyBudgetKg,
    },
    create: {
      userId: dbUser.id,
      month: startOfMonth,
      targetKg: parsed.monthlyBudgetKg,
    },
  });

  return { success: true };
}

export async function fetchProfileAndBudget() {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    throw new Error('Unauthorized');
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const budget = await prisma.budget.findUnique({
    where: {
      userId_month: {
        userId: dbUser.id,
        month: startOfMonth,
      },
    },
  });

  // Map database uppercase enums back to lowercase frontend keys
  return {
    name: dbUser.name || '',
    city: dbUser.profile?.city || '',
    state: dbUser.profile?.state || '',
    country: dbUser.profile?.country || 'India',
    householdSize: dbUser.profile?.householdSize || 1,
    dietType: (dbUser.profile?.dietType?.toLowerCase() ||
      'omnivore') as OnboardingInput['dietType'],
    commuteMode: (dbUser.profile?.commuteMode?.toLowerCase() ||
      'car') as OnboardingInput['commuteMode'],
    commuteDistance: dbUser.profile?.commuteDistanceKm || 0,
    monthlyKwh: dbUser.profile?.electricityUsageKwh || 0,
    monthlyBudgetKg: budget?.targetKg || 500,
  };
}
