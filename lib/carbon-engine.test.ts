import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ActivityCategory } from '../app/generated/prisma';
import {
  calculateBaselineFootprint,
  calculateCo2e,
  calculateEnergy,
  calculateFood,
  calculateTransport,
  clearCache,
  sumActivitiesByCategory,
} from './carbon-engine';
import { prisma } from './prisma';

// Mock the prisma client
vi.mock('./prisma', () => ({
  prisma: {
    emissionFactor: {
      findMany: vi.fn(),
    },
    activityLog: {
      findMany: vi.fn(),
    },
  },
}));

describe('Carbon Engine Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe('calculateBaselineFootprint (Onboarding Baseline)', () => {
    it('calculates baseline carbon footprint correctly', () => {
      const result = calculateBaselineFootprint({
        dietType: 'vegan',
        commuteMode: 'car',
        commuteDistance: 10,
        monthlyKwh: 100,
      });

      // Diet: vegan = 45
      // Commute: car = 0.2, distance = 10 * 2 * 22 = 440 km => 440 * 0.2 = 88
      // Electricity: 100 * 0.4 = 40
      // Total = 45 + 88 + 40 = 173
      expect(result).toBe(173);
    });

    it('handles remote work and walking commute correctly', () => {
      const result = calculateBaselineFootprint({
        dietType: 'heavy-meat',
        commuteMode: 'walking',
        commuteDistance: 15,
        monthlyKwh: 200,
      });

      // Diet: heavy-meat = 135
      // Commute: walking = 0 => 0
      // Electricity: 200 * 0.4 = 80
      // Total = 135 + 80 = 215
      expect(result).toBe(215);
    });
  });

  describe('calculateCo2e (Database/Cache Calculations)', () => {
    beforeEach(() => {
      // Mock emissionFactor.findMany to simulate database content
      vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue([
        {
          id: 'ef-1',
          category: ActivityCategory.TRANSPORT,
          subType: 'petrolCar',
          unit: 'km',
          factor: 0.192,
          description: 'Petrol car per km',
          source: 'UK Gov',
          region: 'GLOBAL',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ef-2',
          category: ActivityCategory.FOOD,
          subType: 'veganMeal',
          unit: 'meal',
          factor: 0.7,
          description: 'Vegan meal',
          source: 'UK Gov',
          region: 'GLOBAL',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ef-3',
          category: ActivityCategory.ENERGY,
          subType: 'indiaGrid',
          unit: 'kWh',
          factor: 0.71,
          description: 'India grid per kWh',
          source: 'CEA',
          region: 'IN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('loads and caches factors from the database on first call', async () => {
      const result1 = await calculateCo2e('transport', 'petrolCar', 100);
      expect(result1).toBeCloseTo(19.2);
      expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(1);

      // Second call should hit the cache and not query the database again
      const result2 = await calculateCo2e('food', 'veganMeal', 5);
      expect(result2).toBeCloseTo(3.5);
      expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(1);
    });

    it('calculates transport emissions correctly', async () => {
      const result = await calculateTransport('petrolCar', 50);
      expect(result).toBeCloseTo(9.6);
    });

    it('calculates food emissions correctly', async () => {
      const result = await calculateFood('veganMeal', 10);
      expect(result).toBeCloseTo(7.0);
    });

    it('calculates energy emissions correctly', async () => {
      const result = await calculateEnergy(200);
      expect(result).toBeCloseTo(142.0);
    });

    it('throws error for negative quantities', async () => {
      await expect(calculateCo2e('transport', 'petrolCar', -10)).rejects.toThrow(
        'Quantity cannot be negative',
      );
    });

    it('throws error for invalid categories', async () => {
      await expect(calculateCo2e('INVALID_CAT', 'petrolCar', 10)).rejects.toThrow(
        'Invalid activity category: INVALID_CAT',
      );
    });

    it('throws error for missing active emission factors', async () => {
      await expect(calculateCo2e('transport', 'nonExistentSub', 10)).rejects.toThrow(
        'Missing active emission factor for category: transport, subType: nonExistentSub',
      );
    });
  });

  describe('sumActivitiesByCategory (Period Aggregation)', () => {
    it('aggregates emissions summed by category correctly', async () => {
      // Mock activity logs returned from database query
      vi.mocked(prisma.activityLog.findMany).mockResolvedValue([
        {
          id: 'log-1',
          userId: 'user-1',
          emissionFactorId: 'ef-1',
          category: ActivityCategory.TRANSPORT,
          subType: 'petrolCar',
          quantity: 100,
          unit: 'km',
          factorUsed: 0.192,
          co2eKg: 19.2,
          note: null,
          occurredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log-2',
          userId: 'user-1',
          emissionFactorId: 'ef-2',
          category: ActivityCategory.FOOD,
          subType: 'veganMeal',
          quantity: 10,
          unit: 'meal',
          factorUsed: 0.7,
          co2eKg: 7.0,
          note: null,
          occurredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log-3',
          userId: 'user-1',
          emissionFactorId: 'ef-1',
          category: ActivityCategory.TRANSPORT,
          subType: 'petrolCar',
          quantity: 50,
          unit: 'km',
          factorUsed: 0.192,
          co2eKg: 9.6,
          note: null,
          occurredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const summary = await sumActivitiesByCategory('user-1', 'month');

      expect(summary.transport).toBeCloseTo(28.8);
      expect(summary.food).toBeCloseTo(7.0);
      expect(summary.energy).toBeCloseTo(0);
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            occurredAt: expect.any(Object),
          }),
        }),
      );
    });
  });
});
