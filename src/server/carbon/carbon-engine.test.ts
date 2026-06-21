import { describe, expect, it, vi, beforeEach } from 'vitest';
import { prisma } from '@/src/db/prisma';
import {
  calculateBaselineFootprint,
  calculateCo2e,
  calculateTransport,
  calculateFood,
  calculateEnergy,
  loadFactors,
  clearCache,
  getEmissionFactorInfo,
} from './carbon-engine.service';

vi.mock('@/src/db/prisma', () => ({
  prisma: {
    emissionFactor: {
      findMany: vi.fn(),
    },
  },
}));

const mockFactors = [
  {
    id: '1',
    category: 'TRANSPORT',
    subType: 'petrolcar',
    factor: 0.192,
    unit: 'km',
    isActive: true,
    region: null,
  },
  {
    id: '2',
    category: 'FOOD',
    subType: 'veganmeal',
    factor: 0.5,
    unit: 'meal',
    isActive: true,
    region: null,
  },
  {
    id: '3',
    category: 'ENERGY',
    subType: 'indiagrid',
    factor: 0.8,
    unit: 'kWh',
    isActive: true,
    region: null,
  },
];

describe('Carbon Engine Service', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue(mockFactors as unknown as Awaited<ReturnType<typeof prisma.emissionFactor.findMany>>);
  });

  describe('calculateBaselineFootprint', () => {
    it('calculates the baseline correct logic for vegan/walk/100kwh', () => {
      const data = {
        dietType: 'vegan',
        commuteMode: 'walking',
        commuteDistance: 5,
        monthlyKwh: 100,
      };
      // diet = 45
      // commute = 0
      // electricity = 100 * 0.4 = 40
      // expected = 45 + 0 + 40 = 85
      const result = calculateBaselineFootprint(data);
      expect(result).toBeCloseTo(85);
    });

    it('calculates baseline for heavy-meat and car', () => {
      const data = {
        dietType: 'heavy-meat',
        commuteMode: 'car',
        commuteDistance: 10,
        monthlyKwh: 200,
      };
      // diet = 135
      // commute = 10 * 2 * 22 * 0.2 = 88
      // electricity = 200 * 0.4 = 80
      // expected = 135 + 88 + 80 = 303
      const result = calculateBaselineFootprint(data);
      expect(result).toBeCloseTo(303);
    });
  });

  describe('loadFactors and cache lifecycle', () => {
    it('queries DB on first call and caches them subsequently', async () => {
      await loadFactors();
      await loadFactors();
      expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(1);
    });

    it('reloads from DB if forceReload is true', async () => {
      await loadFactors();
      await loadFactors(true);
      expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(2);
    });

    it('reloads from DB after clearCache is called', async () => {
      await loadFactors();
      clearCache();
      await loadFactors();
      expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getEmissionFactorInfo', () => {
    it('returns factor details for correct category and subtype', async () => {
      const info = await getEmissionFactorInfo('transport', 'petrolcar');
      expect(info).not.toBeNull();
      expect(info?.factor).toBe(0.192);
      expect(info?.unit).toBe('km');
    });

    it('returns null for non-existing category or subtype', async () => {
      const info = await getEmissionFactorInfo('transport', 'electriccar');
      expect(info).toBeNull();
    });
  });

  describe('calculateCo2e', () => {
    it('calculates correct value from quantity and factor', async () => {
      const result = await calculateCo2e('transport', 'petrolcar', 10);
      expect(result).toBeCloseTo(1.92);
    });

    it('throws error for negative quantity', async () => {
      await expect(calculateCo2e('transport', 'petrolcar', -5)).rejects.toThrow(
        'Quantity cannot be negative',
      );
    });

    it('throws error for invalid category', async () => {
      await expect(calculateCo2e('invalid_cat', 'petrolcar', 10)).rejects.toThrow(
        'Invalid activity category: invalid_cat',
      );
    });

    it('throws error for missing active factor', async () => {
      await expect(calculateCo2e('transport', 'unknown_mode', 10)).rejects.toThrow(
        'Missing active emission factor for category: transport, subType: unknown_mode',
      );
    });
  });

  describe('helper calculations', () => {
    it('calculates transport helper emissions correctly', async () => {
      const result = await calculateTransport('petrolcar', 50);
      expect(result).toBeCloseTo(9.6);
    });

    it('calculates food helper emissions correctly', async () => {
      const result = await calculateFood('veganmeal', 4);
      expect(result).toBeCloseTo(2.0);
    });

    it('calculates energy helper emissions correctly', async () => {
      // note: calculateEnergy uses hardcoded 'indiaGrid' subType
      const result = await calculateEnergy(150);
      expect(result).toBeCloseTo(120.0);
    });
  });
});
