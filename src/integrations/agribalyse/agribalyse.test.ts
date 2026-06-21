import { describe, expect, it } from 'vitest';

import { detectColumnMapping, mapRawRowToNormalizedFactor, parseLocalizedNumber } from './column-mapper';
import { calculateAgribalyseCo2eKg } from './estimate';
import { parseAgribalyseCsv } from './import-parser';

describe('Agribalyse helpers', () => {
  it('parses comma decimals and calculates CO2e from kg quantity', () => {
    expect(parseLocalizedNumber('1,23')).toBe(1.23);
    expect(calculateAgribalyseCo2eKg({ quantityKg: 0.25, climateChangeKgCo2ePerKg: 2.1 })).toBe(0.525);
  });

  it('detects common headers and normalizes CSV rows', async () => {
    const rows = await parseAgribalyseCsv(
      Buffer.from('Food name;Category;Climate change kg CO2 eq/kg\nRice, cooked;Cereals;2,1\n'),
    );
    const mapping = detectColumnMapping(Object.keys(rows[0]));
    const factor = mapRawRowToNormalizedFactor({
      row: rows[0],
      mapping: mapping as { name: string; climateChangeKgCo2ePerKg: string; category: string },
      version: '3.2',
    });

    expect(mapping.name).toBe('Food name');
    expect(mapping.climateChangeKgCo2ePerKg).toBe('Climate change kg CO2 eq/kg');
    expect(factor?.name).toBe('Rice, cooked');
    expect(factor?.category).toBe('Cereals');
    expect(factor?.climateChangeKgCo2ePerKg).toBe(2.1);
  });
});
