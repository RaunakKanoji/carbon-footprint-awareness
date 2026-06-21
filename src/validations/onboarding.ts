import { z } from 'zod';

export const onboardingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name is too long.'),

  city: z.string().trim().min(1, 'City is required.').max(120, 'City is too long.'),

  state: z.string().trim().min(1, 'State is required.').max(120, 'State is too long.'),

  country: z.string().trim().min(1, 'Country is required.').max(120, 'Country is too long.'),

  householdSize: z
    .number()
    .int('Household size must be a whole number.')
    .min(1, 'Household size must be at least 1.')
    .max(20, 'Household size seems too high.'),

  dietType: z.enum(['omnivore', 'mixed', 'heavy-meat', 'pescatarian', 'vegetarian', 'vegan']),

  commuteMode: z.enum(['car', 'motorcycle', 'public-transit', 'metro', 'walk', 'bike', 'remote']),

  commuteDistance: z
    .number()
    .min(0, 'Commute distance cannot be negative.')
    .max(500, 'Commute distance seems too high.'),

  monthlyKwh: z
    .number()
    .min(0, 'Monthly electricity use cannot be negative.')
    .max(100000, 'Monthly electricity use seems too high.'),

  monthlyBudgetKg: z
    .number()
    .min(1, 'Monthly carbon target must be at least 1 kg CO₂e.')
    .max(100000, 'Monthly carbon target seems too high.'),

  mealFrequency: z
    .number()
    .int('Meals per week must be a whole number.')
    .min(1, 'Meals per week must be at least 1.')
    .max(42, 'Meals per week seems too high.'),

  vehicleFuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'none']),

  shoppingFrequency: z.enum(['rarely', 'monthly', 'weekly']),

  wasteHabits: z.enum(['mixed', 'recycle', 'compost', 'landfill']),

  travelFrequency: z.enum(['rare', 'occasional', 'frequent']),

  reductionGoal: z.enum(['easy', 'balanced', 'ambitious']),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
