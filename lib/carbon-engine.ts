import { ActivityCategory } from '../app/generated/prisma';
import emissionFactors from '../data/emission-factors.json';
import { prisma } from './prisma';

export type OnboardingData = {
  dietType: string;
  commuteMode: string;
  commuteDistance: number;
  monthlyKwh: number;
};

// Pure function for onboarding baseline calculation, kept for compatibility
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

// In-memory cache for database emission factors
interface CachedFactor {
  id: string;
  factor: number;
  unit: string;
  region: string | null;
}

let cachedFactors: Record<string, CachedFactor> | null = null;

/**
 * Loads all active emission factors from the database into the in-memory cache.
 */
export async function loadFactors(forceReload = false): Promise<void> {
  if (!cachedFactors || forceReload) {
    const factors = await prisma.emissionFactor.findMany({
      where: { isActive: true },
    });

    cachedFactors = {};
    for (const f of factors) {
      const key = `${f.category.toUpperCase()}:${f.subType.toLowerCase()}`;
      cachedFactors[key] = {
        id: f.id,
        factor: f.factor,
        unit: f.unit,
        region: f.region,
      };
    }
  }
}

/**
 * Clears the in-memory cache.
 */
export function clearCache(): void {
  cachedFactors = null;
}

/**
 * Resolves details for a specific emission factor category and subType.
 */
export async function getEmissionFactorInfo(
  category: string,
  subType: string,
): Promise<CachedFactor | null> {
  await loadFactors();
  const mappedCategory = category.toUpperCase() as ActivityCategory;
  const key = `${mappedCategory}:${subType.toLowerCase()}`;
  return cachedFactors?.[key] || null;
}

/**
 * Generic calculation function converting quantities to estimated CO2e emissions (kg)
 * using database emission factors.
 */
export async function calculateCo2e(
  category: string,
  subType: string,
  quantity: number,
): Promise<number> {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  const mappedCategory = category.toUpperCase();
  const validCategories = Object.values(ActivityCategory) as string[];
  if (!validCategories.includes(mappedCategory)) {
    throw new Error(`Invalid activity category: ${category}`);
  }

  await loadFactors();
  const key = `${mappedCategory}:${subType.toLowerCase()}`;
  const factorInfo = cachedFactors?.[key];

  if (!factorInfo) {
    throw new Error(
      `Missing active emission factor for category: ${category}, subType: ${subType}`,
    );
  }

  return quantity * factorInfo.factor;
}

/**
 * Helper calculation function for transport travel.
 */
export async function calculateTransport(subType: string, distanceKm: number): Promise<number> {
  return calculateCo2e('transport', subType, distanceKm);
}

/**
 * Helper calculation function for food consumption.
 */
export async function calculateFood(subType: string, meals: number): Promise<number> {
  return calculateCo2e('food', subType, meals);
}

/**
 * Helper calculation function for energy utilities.
 */
export async function calculateEnergy(kWh: number): Promise<number> {
  return calculateCo2e('energy', 'indiaGrid', kWh);
}

/**
 * Aggregates user emissions (CO2e kg) summed by category for a specific time period.
 */
export async function sumActivitiesByCategory(
  userId: string,
  period: 'day' | 'week' | 'month',
): Promise<Record<string, number>> {
  const now = new Date();
  const startDate = new Date();

  if (period === 'day') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    // Start of the week: Monday of the current week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    throw new Error(`Unsupported period: ${period}`);
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      userId,
      occurredAt: {
        gte: startDate,
      },
    },
    select: {
      category: true,
      co2eKg: true,
    },
  });

  const summary: Record<string, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    waste: 0,
    offset: 0,
    other: 0,
  };

  for (const log of logs) {
    const key = log.category.toLowerCase();
    if (key in summary) {
      summary[key] += log.co2eKg;
    } else {
      summary[key] = (summary[key] || 0) + log.co2eKg;
    }
  }

  return summary;
}
