import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import { buildClimatiqEstimateFromMapping, estimateWithClimatiq } from '@/src/server/carbon/climatiq.service';
import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';
import { getCandidateCategoryTags } from '@/src/integrations/open-food-facts/category-mapping';
import { estimateOpenFoodFactsProductWithAgribalyse } from '@/src/server/food/agribalyse-estimate.service';
import type {
  NormalizedOpenFoodFactsProduct,
  ProductCarbonEstimateResult,
} from '@/src/integrations/open-food-facts/types';
import { isPlaceholderClimatiqActivityId } from '@/src/integrations/climatiq/factor-mappings';

type FoodMapping = Awaited<ReturnType<typeof findBestFoodCategoryMapping>>;

function getFoodCarbonFactorMappingDelegate() {
  if (!prisma.foodCarbonFactorMapping) {
    throw new Error(
      'Food carbon factor mappings are unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.foodCarbonFactorMapping;
}

function getProductScanDelegate() {
  if (!prisma.productScan) {
    throw new Error(
      'Product scan storage is unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.productScan;
}

function parseWeightKg(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.toLowerCase().match(/([\d.]+)\s*(kg|g|ml|l)\b/);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;

  const unit = match[2];
  if (unit === 'kg' || unit === 'l') return amount;
  if (unit === 'g' || unit === 'ml') return amount / 1000;
  return undefined;
}

function determineQuantityKg(input: {
  quantityKg?: number;
  product: NormalizedOpenFoodFactsProduct;
  mapping: NonNullable<FoodMapping>;
}) {
  return determineQuantityKgFromProduct({
    quantityKg: input.quantityKg,
    product: input.product,
    defaultWeightKg: input.mapping.defaultWeightKg,
  });
}

function determineQuantityKgFromProduct(input: {
  quantityKg?: number;
  product: NormalizedOpenFoodFactsProduct;
  defaultWeightKg?: number | null;
}) {
  if (input.quantityKg && input.quantityKg > 0) return input.quantityKg;
  if (input.product.productQuantity && input.product.productQuantity > 0) {
    return input.product.productQuantity / 1000;
  }
  return (
    parseWeightKg(input.product.quantity) ??
    parseWeightKg(input.product.servingSize) ??
    input.defaultWeightKg ??
    undefined
  );
}

export async function estimateUsingOpenFoodFactsProductFootprint(input: {
  product: NormalizedOpenFoodFactsProduct;
  quantityKg?: number;
}): Promise<{
  result: ProductCarbonEstimateResult;
  quantityKg?: number;
}> {
  if (input.product.carbonFootprintKgPerKg) {
    const quantityKg = determineQuantityKgFromProduct({
      quantityKg: input.quantityKg,
      product: input.product,
    });

    if (!quantityKg || quantityKg <= 0) {
      return {
        result: {
          status: 'MISSING_QUANTITY',
          message:
            'Product carbon footprint is available, but a usable product weight is required.',
          factorSource: input.product.carbonFootprintSource,
          metadata: {
            carbonFootprintKgPerKg: input.product.carbonFootprintKgPerKg,
          },
        },
      };
    }

    return {
      quantityKg,
      result: {
        status: 'ESTIMATED',
        co2eKg: Number((quantityKg * input.product.carbonFootprintKgPerKg).toFixed(3)),
        provider: 'OPEN_FOOD_FACTS',
        factorLabel: 'Open Food Facts product carbon footprint',
        factorSource: input.product.carbonFootprintSource,
        confidence: 'MEDIUM',
        metadata: {
          quantityKg,
          carbonFootprintKgPerKg: input.product.carbonFootprintKgPerKg,
          carbonFootprintPercentKnownIngredients:
            input.product.carbonFootprintPercentKnownIngredients,
        },
      },
    };
  }

  if (input.product.carbonFootprintKgPerProduct) {
    return {
      result: {
        status: 'ESTIMATED',
        co2eKg: input.product.carbonFootprintKgPerProduct,
        provider: 'OPEN_FOOD_FACTS',
        factorLabel: 'Open Food Facts product carbon footprint',
        factorSource: input.product.carbonFootprintSource,
        confidence: 'MEDIUM',
        metadata: {
          carbonFootprintKgPerProduct: input.product.carbonFootprintKgPerProduct,
          carbonFootprintPercentKnownIngredients:
            input.product.carbonFootprintPercentKnownIngredients,
        },
      },
    };
  }

  return {
    result: {
      status: 'NO_CATEGORY_MAPPING',
      message: 'Product found, but no reliable carbon factor is mapped yet.',
    },
  };
}

export async function findBestFoodCategoryMapping(product: {
  categoryTags: string[];
  categories: string[];
}) {
  const candidates = getCandidateCategoryTags(product);
  const foodCarbonFactorMapping = getFoodCarbonFactorMappingDelegate();

  for (const tag of candidates) {
    const exact = await foodCarbonFactorMapping.findFirst({
      where: { openFoodFactsTag: tag, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (exact) return exact;
  }

  for (const tag of candidates) {
    const parts = tag.split('-');
    while (parts.length > 1) {
      parts.pop();
      const parentTag = parts.join('-');
      const parent = await foodCarbonFactorMapping.findFirst({
        where: { openFoodFactsTag: parentTag, isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
      if (parent) return parent;
    }
  }

  return foodCarbonFactorMapping.findFirst({
    where: { appCategory: 'FOOD', isActive: true, openFoodFactsTag: null },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function estimateUsingManualFactor(input: {
  quantityKg: number;
  mapping: NonNullable<FoodMapping>;
}): Promise<ProductCarbonEstimateResult> {
  if (!input.mapping.manualCo2ePerKg) {
    return {
      status: 'NO_CATEGORY_MAPPING',
      message: 'Product found, but no reliable carbon factor is mapped yet.',
    };
  }

  return {
    status: 'ESTIMATED',
    co2eKg: Number((input.quantityKg * input.mapping.manualCo2ePerKg).toFixed(3)),
    provider: 'MANUAL',
    factorLabel: input.mapping.label,
    factorSource: 'Manual food emission factor',
    confidence: input.mapping.confidence as 'LOW' | 'MEDIUM' | 'HIGH',
    metadata: { mappingId: input.mapping.id, quantityKg: input.quantityKg },
  };
}

export async function estimateUsingClimatiq(input: {
  quantityKg: number;
  mapping: NonNullable<FoodMapping>;
}): Promise<ProductCarbonEstimateResult> {
  if (!input.mapping.climatiqActivityId) {
    return {
      status: 'NO_CATEGORY_MAPPING',
      message: 'Product found, but no reliable carbon factor is mapped yet.',
    };
  }
  if (isPlaceholderClimatiqActivityId(input.mapping.climatiqActivityId)) {
    throw new Error('Cannot estimate with a placeholder Climatiq activity ID');
  }

  const estimate = await estimateWithClimatiq({
    payload: buildClimatiqEstimateFromMapping({
      mapping: {
        label: input.mapping.label,
        appCategory: input.mapping.appCategory,
        appActivityType: input.mapping.openFoodFactsTag ?? input.mapping.appCategory,
        activityId: input.mapping.climatiqActivityId,
        factorId: input.mapping.climatiqFactorId,
        dataVersion: input.mapping.climatiqDataVersion ?? process.env.CLIMATIQ_DATA_VERSION ?? '^33',
        region: input.mapping.climatiqRegion,
        unitType: input.mapping.unitType,
      },
      parameters: { weight: input.quantityKg, weight_unit: 'kg' },
    }) as unknown as Record<string, unknown>,
  });

  return {
    status: 'ESTIMATED',
    co2eKg: estimate.co2eKg,
    provider: 'CLIMATIQ',
    factorLabel: input.mapping.label,
    factorSource: estimate.emissionFactor?.source ?? 'Climatiq mapped factor',
    confidence: input.mapping.confidence as 'LOW' | 'MEDIUM' | 'HIGH',
    metadata: {
      mappingId: input.mapping.id,
      quantityKg: input.quantityKg,
      climatiq: estimate,
    },
  };
}

export async function estimateUsingAgribalyseIfAvailable(): Promise<ProductCarbonEstimateResult> {
  return {
    status: 'NO_CATEGORY_MAPPING',
    message: 'Agribalyse mapping is not configured for this product yet.',
  };
}

export async function estimateProductCarbon(input: {
  userId: string;
  barcode: string;
  quantityKg?: number;
  servings?: number;
  scanContext?: string;
  createActivityLog?: boolean;
}) {
  const { product } = await getProductByBarcode({ barcode: input.barcode });

  if (!product.found) {
    return {
      product,
      result: {
        status: 'NO_PRODUCT_FOUND',
        message: 'No product was found for this barcode.',
      } satisfies ProductCarbonEstimateResult,
    };
  }

  const agribalyse = await estimateOpenFoodFactsProductWithAgribalyse({
    userId: input.userId,
    barcode: input.barcode,
    quantityKg: input.quantityKg,
    createActivityLog: input.createActivityLog,
  });

  if (agribalyse.status === 'ESTIMATED' && 'estimate' in agribalyse && agribalyse.estimate) {
    const agribalyseEstimate = agribalyse.estimate;
    return {
      product,
      result: {
        status: 'ESTIMATED',
        co2eKg: agribalyseEstimate.co2eKg,
        provider: 'AGRIBALYSE',
        factorLabel: agribalyseEstimate.factor?.name,
        factorSource: 'Agribalyse local dataset',
        confidence: agribalyse.confidence ?? agribalyseEstimate.confidence,
        metadata: {
          factor: agribalyse.factor,
          mapping: agribalyse.mapping,
          matchScore: agribalyse.matchScore,
        },
      } satisfies ProductCarbonEstimateResult,
      activity: agribalyse.activity,
      quantityKg: agribalyseEstimate.quantityKg,
      mapping: agribalyse.mapping,
    };
  }

  const exactFootprint = await estimateUsingOpenFoodFactsProductFootprint({
    product,
    quantityKg: input.quantityKg,
  });
  if (exactFootprint.result.status === 'ESTIMATED') {
    const activity = await createProductActivityIfRequested({
      userId: input.userId,
      product,
      result: exactFootprint.result,
      quantityKg: exactFootprint.quantityKg,
      scanContext: input.scanContext,
      createActivityLog: input.createActivityLog,
      sourcePayload: {
        barcode: product.barcode,
        quantityKg: exactFootprint.quantityKg,
        source: 'open_food_facts_product_carbon_footprint',
      },
      calculationMethod: 'open_food_facts_product_carbon_footprint',
    });

    return {
      product,
      result: exactFootprint.result,
      activity,
      quantityKg: exactFootprint.quantityKg,
      mapping: null,
    };
  }

  const mapping = await findBestFoodCategoryMapping(product);
  if (!mapping) {
    return {
      product,
      result: {
        status: 'NO_CATEGORY_MAPPING',
        message: 'Product found, but no reliable carbon factor is mapped yet.',
      } satisfies ProductCarbonEstimateResult,
    };
  }

  const quantityKg = determineQuantityKg({ quantityKg: input.quantityKg, product, mapping });
  if (!quantityKg || quantityKg <= 0) {
    return {
      product,
      result: {
        status: 'MISSING_QUANTITY',
        message: 'Product found, but a usable product weight is required for carbon estimation.',
        metadata: { mappingId: mapping.id },
      } satisfies ProductCarbonEstimateResult,
    };
  }

  let result: ProductCarbonEstimateResult;
  if (mapping.provider === 'CLIMATIQ') {
    result = await estimateUsingClimatiq({ quantityKg, mapping });
  } else if (mapping.provider === 'MANUAL') {
    result = await estimateUsingManualFactor({ quantityKg, mapping });
  } else if (mapping.provider === 'AGRIBALYSE') {
    result = await estimateUsingAgribalyseIfAvailable();
  } else {
    result = {
      status: 'UNSUPPORTED_PRODUCT',
      message: 'This product mapping uses an unsupported carbon provider.',
    };
  }

  const activity = await createProductActivityIfRequested({
    userId: input.userId,
    product,
    result,
    quantityKg,
    scanContext: input.scanContext,
    createActivityLog: input.createActivityLog,
    sourcePayload: {
      barcode: product.barcode,
      quantityKg,
      categoryTags: product.categoryTags,
      mappingId: mapping.id,
    },
    calculationMethod: 'barcode_category_mapping',
  });

  return { product, result, activity, quantityKg, mapping };
}

async function createProductActivityIfRequested(input: {
  userId: string;
  product: NormalizedOpenFoodFactsProduct;
  result: ProductCarbonEstimateResult;
  quantityKg?: number;
  scanContext?: string;
  createActivityLog?: boolean;
  sourcePayload: Record<string, unknown>;
  calculationMethod: string;
}) {
  if (!input.createActivityLog || input.result.status !== 'ESTIMATED' || !input.result.co2eKg) {
    return null;
  }

  const activity = await prisma.activityLog.create({
    data: {
      userId: input.userId,
      category: 'FOOD',
      subType: input.product.productName || 'food_product',
      activityType: input.product.productName || 'food_product',
      quantity: input.quantityKg ?? 1,
      unit: input.quantityKg ? 'kg' : 'product',
      weightValue: input.quantityKg,
      weightUnit: input.quantityKg ? 'kg' : undefined,
      co2eKg: input.result.co2eKg,
      provider: input.result.provider ?? 'MANUAL',
      sourceEndpoint: 'open_food_facts_product_lookup_plus_carbon_mapping',
      sourcePayload: input.sourcePayload as Prisma.InputJsonValue,
      sourceResponse: { product: input.product, estimate: input.result } as Prisma.InputJsonValue,
      confidence: input.result.confidence ?? 'MEDIUM',
      calculationMethod: input.calculationMethod,
      note: input.scanContext ? `Product scan: ${input.scanContext}` : 'Product scan',
    },
  });

  await handleNewActivityLog(activity);

  await getProductScanDelegate().updateMany({
    where: { userId: input.userId, barcode: input.product.barcode },
    data: { carbonEstimated: true, activityLogId: activity.id },
  });

  return activity;
}
