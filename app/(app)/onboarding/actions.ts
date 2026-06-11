'use server';

import { auth } from '@clerk/nextjs/server';

import { calculateBaselineFootprint } from '@/lib/carbon-engine';
import { OnboardingInput, onboardingSchema } from '@/lib/validations/onboarding';

export async function submitOnboarding(data: OnboardingInput) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error('Unauthorized');
  }

  // Validate the data
  const parsed = onboardingSchema.parse(data);

  // Calculate the baseline footprint
  const baselineFootprint = calculateBaselineFootprint({
    dietType: parsed.dietType,
    commuteMode: parsed.commuteMode,
    commuteDistance: parsed.commuteDistance,
    monthlyKwh: parsed.monthlyKwh,
  });

  // Ignoring Prisma for now
  console.log('Skipping Prisma save for user:', clerkId);

  return { success: true, baselineFootprint };
}
