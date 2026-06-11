import { z } from 'zod';

export const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  householdSize: z.number().int().positive().max(20),
  dietType: z.enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'mixed', 'heavy-meat']),
  commuteMode: z.enum([
    'car',
    'motorcycle',
    'public-transit',
    'metro',
    'bicycle',
    'walking',
    'remote',
  ]),
  commuteDistance: z.number().nonnegative(),
  monthlyKwh: z.number().nonnegative(),
  monthlyBudgetKg: z.number().positive(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
