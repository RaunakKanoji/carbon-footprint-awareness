import { describe, expect, it } from 'vitest';
import { onboardingSchema } from './onboarding';

describe('Onboarding Schema Validation', () => {
  const validData = {
    name: 'Jane Doe',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    householdSize: 3,
    dietType: 'vegan',
    commuteMode: 'metro',
    commuteDistance: 15,
    monthlyKwh: 120,
    monthlyBudgetKg: 300,
    mealFrequency: 21,
    vehicleFuelType: 'electric',
    shoppingFrequency: 'monthly',
    wasteHabits: 'recycle',
    travelFrequency: 'occasional',
    reductionGoal: 'balanced',
  };

  it('validates a correct payload successfully', () => {
    const result = onboardingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails validation when required fields are missing', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Name is required.');
    }
  });

  it('fails validation for negative number parameters', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      commuteDistance: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Commute distance cannot be negative.');
    }
  });

  it('fails validation for out-of-range bounds', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      householdSize: 25,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Household size seems too high.');
    }
  });

  it('fails validation for invalid enum choices', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      dietType: 'keto-only',
    });
    expect(result.success).toBe(false);
  });
});
