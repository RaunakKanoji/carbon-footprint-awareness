import { describe, expect, it } from 'vitest';

import { normalizeOpenFoodFactsProduct } from './normalize';

describe('normalizeOpenFoodFactsProduct', () => {
  it('normalizes Agribalyse carbon footprint data from Eco-score payload', () => {
    const product = normalizeOpenFoodFactsProduct({
      code: '8901123001214',
      status: 1,
      product: {
        code: '8901123001214',
        product_name: 'Lotte Choco Pie',
        quantity: '23g',
        serving_size: '23g',
        product_quantity: 23,
        ecoscore_grade: 'd',
        ecoscore_score: 37,
        ecoscore_data: {
          agribalyse: {
            co2_total: 3.59,
          },
        },
      },
    });

    expect(product.greenScoreLabel).toBe('Green-Score D');
    expect(product.environmentalImpactLabel).toBe('High environmental impact');
    expect(product.carbonFootprintKgPerKg).toBe(3.59);
    expect(product.carbonFootprintGPer100g).toBe(359);
    expect(product.carbonFootprintDisplay).toBe('359 g CO2e per 100g of product');
    expect(product.carbonFootprintPetrolCarKmEquivalentPer100g).toBe(1.9);
    expect(product.carbonFootprintPetrolCarEquivalentDisplay).toBe(
      'Equal to driving 1.9 km in a petrol car',
    );
  });
});
