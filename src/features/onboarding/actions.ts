'use server';

import { revalidatePath } from 'next/cache';

import { CommuteMode, DietType, type Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { type OnboardingInput, onboardingSchema } from '@/src/validations/onboarding';
import { getCurrentUser } from '@/src/lib/auth';

function mapDietType(value: OnboardingInput['dietType']): DietType {
  switch (value) {
    case 'vegan':
      return DietType.VEGAN;
    case 'vegetarian':
      return DietType.VEGETARIAN;
    case 'pescatarian':
      return DietType.PESCATARIAN;
    case 'mixed':
      return DietType.MIXED;
    case 'heavy-meat':
      return DietType.OTHER;
    default:
      return DietType.OMNIVORE;
  }
}

function mapCommuteMode(value: OnboardingInput['commuteMode']): CommuteMode {
  switch (value) {
    case 'motorcycle':
      return CommuteMode.MOTORBIKE;
    case 'public-transit':
      return CommuteMode.BUS;
    case 'metro':
      return CommuteMode.METRO;
    case 'walk':
      return CommuteMode.WALK;
    case 'bike':
      return CommuteMode.BICYCLE;
    case 'remote':
      return CommuteMode.WORK_FROM_HOME;
    default:
      return CommuteMode.CAR;
  }
}

function mapBudgetType(value: OnboardingInput['reductionGoal']): string {
  return value.toUpperCase();
}

function calculateBaselineFootprint(input: OnboardingInput) {
  let foodKg = 105;

  if (input.dietType === 'vegan') foodKg = 45;
  else if (input.dietType === 'vegetarian') foodKg = 60;
  else if (input.dietType === 'pescatarian') foodKg = 75;
  else if (input.dietType === 'mixed') foodKg = 90;
  else if (input.dietType === 'heavy-meat') foodKg = 135;

  const commuteDistanceKm = Number(input.commuteDistance) || 0;
  const monthlyCommuteDistance = commuteDistanceKm * 2 * 22;

  let commuteFactor = 0;

  if (input.commuteMode === 'car') {
    commuteFactor = input.vehicleFuelType === 'diesel' ? 0.17 : 0.2;
  } else if (input.commuteMode === 'motorcycle') {
    commuteFactor = 0.1;
  } else if (input.commuteMode === 'public-transit') {
    commuteFactor = 0.05;
  } else if (input.commuteMode === 'metro') {
    commuteFactor = 0.03;
  }

  const commuteKg = monthlyCommuteDistance * commuteFactor;
  const electricityKg = (Number(input.monthlyKwh) || 0) * 0.4;

  let shoppingKg = 35;

  if (input.shoppingFrequency === 'rarely') shoppingKg = 15;
  else if (input.shoppingFrequency === 'weekly') shoppingKg = 75;

  let wasteKg = 18;

  if (input.wasteHabits === 'recycle') wasteKg = 10;
  else if (input.wasteHabits === 'compost') wasteKg = 8;
  else if (input.wasteHabits === 'landfill') wasteKg = 28;

  let travelKg = 20;

  if (input.travelFrequency === 'rare') travelKg = 8;
  else if (input.travelFrequency === 'frequent') travelKg = 60;

  const monthlyFootprintKg = Math.max(
    1,
    Math.round(foodKg + commuteKg + electricityKg + shoppingKg + wasteKg + travelKg),
  );

  const categoryBreakdown = {
    food: foodKg,
    transport: commuteKg,
    energy: electricityKg,
    shopping: shoppingKg,
    waste: wasteKg,
    travel: travelKg,
  };

  const mainImpactCategory = Object.entries(categoryBreakdown)
    .reduce((largest, current) => (current[1] > largest[1] ? current : largest))[0]
    .toUpperCase();

  return {
    monthlyFootprintKg,
    yearlyFootprintKg: monthlyFootprintKg * 12,
    mainImpactCategory,
    categoryBreakdown,
  };
}

function getReductionPercentage(goal: OnboardingInput['reductionGoal']) {
  if (goal === 'easy') return 3;
  if (goal === 'ambitious') return 15;

  return 7;
}

export async function completeOnboarding(input: OnboardingInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('You must be signed in to complete onboarding.');
  }

  const data = onboardingSchema.parse(input);

  const baseline = calculateBaselineFootprint(data);
  const reductionPercentage = getReductionPercentage(data.reductionGoal);

  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);

  const targetDate = new Date(month.getFullYear(), month.getMonth() + 3, 1);

  const suggestedBudgetKg = Math.round(
    baseline.monthlyFootprintKg * (1 - reductionPercentage / 100),
  );

  const monthlyBudgetKg =
    data.monthlyBudgetKg && data.monthlyBudgetKg > 0 ? data.monthlyBudgetKg : suggestedBudgetKg;

  const budgetType =
    data.monthlyBudgetKg && data.monthlyBudgetKg !== suggestedBudgetKg
      ? 'CUSTOM'
      : mapBudgetType(data.reductionGoal);

  const profileUpdateData = {
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country.trim(),
    householdSize: data.householdSize,
    dietType: mapDietType(data.dietType),
    commuteMode: mapCommuteMode(data.commuteMode),
    commuteDistanceKm: data.commuteDistance,
    electricityUsageKwh: data.monthlyKwh,
    mealFrequency: data.mealFrequency,
    vehicleFuelType: data.vehicleFuelType,
    shoppingFrequency: data.shoppingFrequency,
    wasteHabits: data.wasteHabits,
    travelFrequency: data.travelFrequency,
    reductionGoal: data.reductionGoal,
    onboardingAnswers: {
      dietType: data.dietType,
      commuteMode: data.commuteMode,
      commuteDistance: data.commuteDistance,
      monthlyKwh: data.monthlyKwh,
      monthlyBudgetKg,
      mealFrequency: data.mealFrequency,
      vehicleFuelType: data.vehicleFuelType,
      shoppingFrequency: data.shoppingFrequency,
      wasteHabits: data.wasteHabits,
      travelFrequency: data.travelFrequency,
      reductionGoal: data.reductionGoal,
    },
    onboardingComplete: true,
  } satisfies Prisma.ProfileUpdateInput;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: data.name.trim() || user.name || null,
      },
    });

    await tx.profile.upsert({
      where: {
        userId: user.id,
      },
      update: profileUpdateData,
      create: {
        ...profileUpdateData,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await tx.carbonProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        monthlyFootprintKg: baseline.monthlyFootprintKg,
        yearlyFootprintKg: baseline.yearlyFootprintKg,
        mainImpactCategory: baseline.mainImpactCategory,
        categoryBreakdown: baseline.categoryBreakdown,
        dataSources: ['Onboarding questionnaire', 'Carbon Compass internal factors'],
        generatedAt: new Date(),
      },
      create: {
        monthlyFootprintKg: baseline.monthlyFootprintKg,
        yearlyFootprintKg: baseline.yearlyFootprintKg,
        mainImpactCategory: baseline.mainImpactCategory,
        categoryBreakdown: baseline.categoryBreakdown,
        dataSources: ['Onboarding questionnaire', 'Carbon Compass internal factors'],
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await tx.budget.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month,
        },
      },
      update: {
        targetKg: monthlyBudgetKg,
        weeklyTargetKg: monthlyBudgetKg / 4.33,
        reductionPercentage,
        targetDate,
        budgetType,
      },
      create: {
        month,
        targetKg: monthlyBudgetKg,
        weeklyTargetKg: monthlyBudgetKg / 4.33,
        reductionPercentage,
        targetDate,
        budgetType,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  });

  revalidatePath('/onboarding');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  revalidatePath('/settings');

  return {
    success: true,
    monthlyFootprintKg: baseline.monthlyFootprintKg,
    monthlyBudgetKg,
  };
}
