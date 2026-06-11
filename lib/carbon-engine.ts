import emissionFactors from '../data/emission-factors.json';

export type OnboardingData = {
  dietType: string;
  commuteMode: string;
  commuteDistance: number;
  monthlyKwh: number;
};

export function calculateBaselineFootprint(data: OnboardingData): number {
  let total = 0;

  // 1. Diet emissions
  const dietFactor = (emissionFactors.diet as Record<string, number>)[data.dietType] || 105;
  total += dietFactor;

  // 2. Commute emissions (assume commuteDistance is one-way daily, multiply by 2 for round trip, 22 working days)
  const commuteFactor = (emissionFactors.commute as Record<string, number>)[data.commuteMode] || 0;
  const monthlyCommuteDistance = data.commuteDistance * 2 * 22;
  total += monthlyCommuteDistance * commuteFactor;

  // 3. Electricity emissions
  const electricityFactor = emissionFactors.electricity.default;
  total += data.monthlyKwh * electricityFactor;

  return total;
}
