import 'server-only';

import { prisma } from '@/src/db/prisma';
import { calculateAgribalyseCo2eKg } from '@/src/integrations/agribalyse/estimate';
import { scoreFoodFactorMatch, findBestAgribalyseMatch } from '@/src/integrations/agribalyse/matching';
import { validateAgribalyseQuantityKg } from '@/src/integrations/agribalyse/validators';
import type { AgribalyseEstimateResult } from '@/src/integrations/agribalyse/types';
import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';
import { getCandidateCategoryTags } from '@/src/integrations/open-food-facts/category-mapping';
import { findFoodFactorMappingForTags } from './food-mapping.service';
import { getAgribalyseFoodFactorById, searchAgribalyseFoodFactors } from './agribalyse-search.service';
import { saveAgribalyseFoodActivity } from './food-activity.service';

function parseWeightKg(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.toLowerCase().match(/([\d.]+)\s*(kg|g|ml|l)\b/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  if (match[2] === 'kg' || match[2] === 'l') return amount;
  return amount / 1000;
}

export async function estimateFoodWithAgribalyse(input: {
  factorId: string;
  quantityKg: number;
  userId?: string;
  createActivityLog?: boolean;
  sourceContext?: string;
}): Promise<{ estimate: AgribalyseEstimateResult; activity: unknown | null }> {
  if (!validateAgribalyseQuantityKg(input.quantityKg)) {
    return {
      estimate: {
        status: 'INVALID_QUANTITY',
        provider: 'AGRIBALYSE',
        confidence: 'LOW',
        message: 'Quantity must be greater than 0 kg and at most 1000 kg.',
      },
      activity: null,
    };
  }

  const factor = await getAgribalyseFoodFactorById(input.factorId);
  if (!factor) {
    return {
      estimate: {
        status: 'FACTOR_NOT_FOUND',
        provider: 'AGRIBALYSE',
        confidence: 'LOW',
        message: 'Agribalyse factor not found.',
      },
      activity: null,
    };
  }

  const estimate: AgribalyseEstimateResult = {
    status: 'ESTIMATED',
    co2eKg: Number(
      calculateAgribalyseCo2eKg({
        quantityKg: input.quantityKg,
        climateChangeKgCo2ePerKg: factor.climateChangeKgCo2ePerKg,
      }).toFixed(3),
    ),
    quantityKg: input.quantityKg,
    factor: {
      id: factor.id,
      name: factor.name,
      category: factor.category ?? undefined,
      climateChangeKgCo2ePerKg: factor.climateChangeKgCo2ePerKg,
      version: factor.version ?? undefined,
    },
    provider: 'AGRIBALYSE',
    confidence: 'HIGH',
  };

  const activity =
    input.createActivityLog && input.userId
      ? await saveAgribalyseFoodActivity({
          userId: input.userId,
          factor,
          estimate,
          quantityKg: input.quantityKg,
          sourcePayload: { factorId: factor.id, quantityKg: input.quantityKg },
          sourceContext: input.sourceContext,
        })
      : null;

  return { estimate, activity };
}

export async function estimateOpenFoodFactsProductWithAgribalyse(input: {
  userId: string;
  barcode: string;
  quantityKg?: number;
  createActivityLog?: boolean;
}) {
  const { product } = await getProductByBarcode({ barcode: input.barcode });
  if (!product.found) {
    return { status: 'PRODUCT_NOT_FOUND', message: 'Open Food Facts product not found.', product };
  }

  const tags = getCandidateCategoryTags(product);
  const mapping = await findFoodFactorMappingForTags(tags);
  let factor = mapping?.agribalyseFoodFactor ?? null;
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = mapping ? mapping.confidence : 'LOW';
  let matchScore: number | undefined;

  if (!factor) {
    const candidates = await searchAgribalyseFoodFactors({
      query: [product.productName, product.categories[0], product.categoryTags[0]].filter(Boolean).join(' '),
      limit: 10,
    });
    const scored = candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      category: candidate.category,
      score: scoreFoodFactorMatch({
        productTerms: [product.productName ?? '', ...product.categories, ...product.categoryTags],
        factorName: candidate.name,
        category: candidate.category,
      }),
    }));
    const best = findBestAgribalyseMatch(scored);
    if (best.status === 'MATCHED') {
      factor = await getAgribalyseFoodFactorById(best.factorId);
      confidence = best.confidence;
      matchScore = best.score;
    }
  }

  if (!factor) {
    return {
      status: 'NO_RELIABLE_MATCH',
      message: 'Food product found, but no reliable Agribalyse factor mapping exists yet.',
      product,
      categoryTags: product.categoryTags,
    };
  }

  const quantityKg =
    input.quantityKg ??
    (product.productQuantity ? product.productQuantity / 1000 : undefined) ??
    parseWeightKg(product.quantity) ??
    parseWeightKg(product.servingSize) ??
    mapping?.defaultQuantityKg;

  if (!quantityKg || !validateAgribalyseQuantityKg(quantityKg)) {
    return {
      status: 'INVALID_QUANTITY',
      message: 'A valid quantity in kg is required for Agribalyse estimates.',
      product,
      factor,
    };
  }

  const { estimate, activity } = await estimateFoodWithAgribalyse({
    factorId: factor.id,
    quantityKg,
    userId: input.userId,
    createActivityLog: input.createActivityLog,
    sourceContext: 'BARCODE_SCAN',
  });

  if (activity && prisma.productScan) {
    await prisma.productScan.updateMany({
      where: { userId: input.userId, barcode: product.barcode },
      data: { carbonEstimated: true, activityLogId: (activity as { id: string }).id },
    });
  }

  return { status: estimate.status, estimate, activity, product, factor, mapping, confidence, matchScore };
}

export async function estimateManualFoodLogWithAgribalyse(input: {
  userId: string;
  factorId: string;
  quantityKg: number;
  createActivityLog?: boolean;
}) {
  return estimateFoodWithAgribalyse({
    factorId: input.factorId,
    quantityKg: input.quantityKg,
    userId: input.userId,
    createActivityLog: input.createActivityLog,
    sourceContext: 'MANUAL_FOOD_LOG',
  });
}
