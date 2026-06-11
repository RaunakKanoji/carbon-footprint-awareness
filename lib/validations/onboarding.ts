import { z } from 'zod';

export const onboardingSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  householdSize: z.number().int().positive().max(20),
  dietType: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'heavy-meat']),
  commuteMode: z.enum(['car', 'motorcycle', 'public-transit', 'bicycle', 'walking', 'remote']),
  commuteDistance: z.number().nonnegative(),
  monthlyKwh: z.number().nonnegative(),
  monthlyBudgetKg: z.number().positive(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
