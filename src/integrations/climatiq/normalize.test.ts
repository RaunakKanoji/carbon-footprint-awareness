import { describe, expect, it } from 'vitest';

import { createClimatiqCacheKey } from './cache';
import { isPlaceholderClimatiqActivityId } from './factor-mappings';
import { normalizeClimatiqCo2eToKg, parsePossibleNumber } from './normalize';
import {
  buildProductWeightPayload,
  buildSpendBasedPayload,
  buildTransportDistancePayload,
} from './payload-builders';
import { buildClimatiqSearchParams } from './search-params';

describe('Climatiq helpers', () => {
  it('parses numbers and converts co2e units to kg', () => {
    expect(parsePossibleNumber('12.5')).toBe(12.5);
    expect(normalizeClimatiqCo2eToKg({ co2e: 2, co2e_unit: 't' })).toBe(2000);
    expect(normalizeClimatiqCo2eToKg({ co2e: 500, co2e_unit: 'g' })).toBe(0.5);
    expect(normalizeClimatiqCo2eToKg({ co2e: '3.42', co2e_unit: 'kg' })).toBe(3.42);
  });

  it('builds estimate payloads with data version fallback', () => {
    expect(
      buildTransportDistancePayload({
        activityId: 'transport-id',
        distanceValue: 12,
        distanceUnit: 'km',
        region: 'IN',
      }),
    ).toMatchObject({
      emission_factor: {
        activity_id: 'transport-id',
        region: 'IN',
      },
      parameters: {
        distance: 12,
        distance_unit: 'km',
      },
    });

    expect(
      buildSpendBasedPayload({
        activityId: 'spend-id',
        moneyValue: 2500,
        moneyUnit: 'inr',
        spentYear: 2026,
      }),
    ).toMatchObject({
      apply_inflation_adjustment: 2026,
      parameters: {
        money: 2500,
        money_unit: 'inr',
      },
    });

    expect(
      buildProductWeightPayload({
        activityId: 'steel-id',
        weightValue: 2,
        weightUnit: 'kg',
      }),
    ).toMatchObject({
      parameters: {
        weight: 2,
        weight_unit: 'kg',
      },
    });
  });

  it('builds search params and detects placeholder mappings', () => {
    expect(buildClimatiqSearchParams({ query: 'steel' })).toMatchObject({
      query: 'steel',
      page: 1,
      results_per_page: 20,
    });

    expect(isPlaceholderClimatiqActivityId('REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID')).toBe(true);
    expect(isPlaceholderClimatiqActivityId('real-id')).toBe(false);
  });

  it('creates stable cache keys', () => {
    const input = { provider: 'CLIMATIQ', endpoint: 'estimate', payload: { co2e: 1 } };
    expect(createClimatiqCacheKey(input)).toBe(createClimatiqCacheKey(input));
  });
});
