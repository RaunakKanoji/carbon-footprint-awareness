import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import {
  OPEN_FOOD_FACTS_ENDPOINTS,
  OPEN_FOOD_FACTS_PRODUCT_FIELDS,
  OPEN_FOOD_FACTS_PROVIDER,
  PRODUCT_LOOKUP_CACHE_DAYS,
  PRODUCT_SEARCH_CACHE_DAYS,
} from '@/src/integrations/open-food-facts/constants';
import {
  createOpenFoodFactsCacheKey,
  getCacheExpiryDate,
} from '@/src/integrations/open-food-facts/cache';
import { callOpenFoodFacts } from '@/src/integrations/open-food-facts/client';
import {
  normalizeOpenFoodFactsProduct,
  normalizeOpenFoodFactsSearchResult,
} from '@/src/integrations/open-food-facts/normalize';
import type {
  NormalizedOpenFoodFactsProduct,
  OpenFoodFactsProductResponse,
  OpenFoodFactsSearchSummary,
} from '@/src/integrations/open-food-facts/types';
import { isValidBarcode, normalizeBarcode } from '@/src/integrations/open-food-facts/validators';

const OPEN_FOOD_FACTS_PRODUCT_CACHE_VERSION = 2;

function getProductLookupCacheDelegate() {
  if (!prisma.productLookupCache) {
    throw new Error(
      'Product lookup cache is unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.productLookupCache;
}

function getFoodProductDelegate() {
  if (!prisma.foodProduct) {
    throw new Error(
      'Food product storage is unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.foodProduct;
}

export async function saveNormalizedFoodProduct(product: NormalizedOpenFoodFactsProduct) {
  if (!product.barcode || !product.found) return null;

  return getFoodProductDelegate().upsert({
    where: { barcode: product.barcode },
    create: {
      barcode: product.barcode,
      productName: product.productName,
      brand: product.brand,
      quantity: product.quantity,
      servingSize: product.servingSize,
      categories: product.categories,
      categoryTags: product.categoryTags,
      ingredientsText: product.ingredientsText,
      nutriments: product.nutriments as Prisma.InputJsonValue | undefined,
      nutriScore: product.nutriScore,
      novaGroup: product.novaGroup,
      ecoScore: product.ecoScore,
      ecoScoreScore: product.ecoScoreScore,
      packagingTags: product.packagingTags,
      labelsTags: product.labelsTags,
      countriesTags: product.countriesTags,
      imageUrl: product.imageUrl,
      source: OPEN_FOOD_FACTS_PROVIDER,
      sourceResponse: product.rawResponse as Prisma.InputJsonValue,
      lastFetchedAt: new Date(),
    },
    update: {
      productName: product.productName,
      brand: product.brand,
      quantity: product.quantity,
      servingSize: product.servingSize,
      categories: product.categories,
      categoryTags: product.categoryTags,
      ingredientsText: product.ingredientsText,
      nutriments: product.nutriments as Prisma.InputJsonValue | undefined,
      nutriScore: product.nutriScore,
      novaGroup: product.novaGroup,
      ecoScore: product.ecoScore,
      ecoScoreScore: product.ecoScoreScore,
      packagingTags: product.packagingTags,
      labelsTags: product.labelsTags,
      countriesTags: product.countriesTags,
      imageUrl: product.imageUrl,
      sourceResponse: product.rawResponse as Prisma.InputJsonValue,
      lastFetchedAt: new Date(),
    },
  });
}

export async function getProductByBarcode({
  barcode: inputBarcode,
  useCache = true,
}: {
  barcode: string;
  useCache?: boolean;
}): Promise<{ product: NormalizedOpenFoodFactsProduct; fromCache: boolean }> {
  const barcode = normalizeBarcode(inputBarcode);
  if (!isValidBarcode(barcode)) {
    throw new Error('Invalid barcode. Use an EAN, UPC, or GTIN barcode between 8 and 14 digits.');
  }

  const endpoint = OPEN_FOOD_FACTS_ENDPOINTS.productByBarcode(barcode);
  const payload = {
    provider: OPEN_FOOD_FACTS_PROVIDER,
    endpoint,
    barcode,
    fields: OPEN_FOOD_FACTS_PRODUCT_FIELDS,
    version: OPEN_FOOD_FACTS_PRODUCT_CACHE_VERSION,
  };
  const cacheKey = createOpenFoodFactsCacheKey(payload);
  const productLookupCache = getProductLookupCacheDelegate();

  if (useCache) {
    const cached = await productLookupCache.findFirst({
      where: {
        cacheKey,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (cached && cachedProductResponseHasCurrentCarbonFields(cached.sourceResponse)) {
      return {
        product: normalizeOpenFoodFactsProduct(
          cached.sourceResponse as OpenFoodFactsProductResponse,
        ),
        fromCache: true,
      };
    }
  }

  const response = (await callOpenFoodFacts({
    path: endpoint,
    query: { fields: OPEN_FOOD_FACTS_PRODUCT_FIELDS },
  })) as OpenFoodFactsProductResponse;
  const product = normalizeOpenFoodFactsProduct(response);

  await productLookupCache.upsert({
    where: { cacheKey },
    create: {
      provider: OPEN_FOOD_FACTS_PROVIDER,
      endpoint: 'productByBarcode',
      cacheKey,
      barcode,
      sourcePayload: payload,
      sourceResponse: response as Prisma.InputJsonValue,
      expiresAt: getCacheExpiryDate(PRODUCT_LOOKUP_CACHE_DAYS),
    },
    update: {
      sourcePayload: payload,
      sourceResponse: response as Prisma.InputJsonValue,
      expiresAt: getCacheExpiryDate(PRODUCT_LOOKUP_CACHE_DAYS),
    },
  });
  await saveNormalizedFoodProduct(product);

  return { product, fromCache: false };
}

export async function getOrFetchProductByBarcode(input: {
  barcode: string;
  useCache?: boolean;
}) {
  return getProductByBarcode(input);
}

export async function searchOpenFoodFactsProducts({
  query,
  page = 1,
  pageSize = 10,
  useCache = true,
}: {
  query: string;
  page?: number;
  pageSize?: number;
  useCache?: boolean;
}): Promise<{
  results: OpenFoodFactsSearchSummary[];
  rawResponse: unknown;
  fromCache: boolean;
}> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 3) {
    throw new Error('Search query must be at least 3 characters.');
  }

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(25, Math.max(1, pageSize));
  const payload = {
    provider: OPEN_FOOD_FACTS_PROVIDER,
    endpoint: 'search',
    query: normalizedQuery,
    page: safePage,
    pageSize: safePageSize,
  };
  const cacheKey = createOpenFoodFactsCacheKey(payload);
  const productLookupCache = getProductLookupCacheDelegate();

  if (useCache) {
    const cached = await productLookupCache.findFirst({
      where: {
        cacheKey,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (cached) {
      const raw = cached.sourceResponse as { products?: OpenFoodFactsProductResponse['product'][] };
      return {
        results: normalizeSearchProducts(raw.products ?? []),
        rawResponse: raw,
        fromCache: true,
      };
    }
  }

  const response = (await callOpenFoodFacts({
    path: OPEN_FOOD_FACTS_ENDPOINTS.search,
    query: {
      search_terms: normalizedQuery,
      page: safePage,
      page_size: safePageSize,
      json: 1,
      fields: OPEN_FOOD_FACTS_PRODUCT_FIELDS,
    },
  })) as { products?: OpenFoodFactsProductResponse['product'][] };

  await productLookupCache.upsert({
    where: { cacheKey },
    create: {
      provider: OPEN_FOOD_FACTS_PROVIDER,
      endpoint: 'search',
      cacheKey,
      query: normalizedQuery,
      sourcePayload: payload,
      sourceResponse: response as Prisma.InputJsonValue,
      expiresAt: getCacheExpiryDate(PRODUCT_SEARCH_CACHE_DAYS),
    },
    update: {
      sourcePayload: payload,
      sourceResponse: response as Prisma.InputJsonValue,
      expiresAt: getCacheExpiryDate(PRODUCT_SEARCH_CACHE_DAYS),
    },
  });

  return {
    results: normalizeSearchProducts(response.products ?? []),
    rawResponse: response,
    fromCache: false,
  };
}

function normalizeSearchProducts(products: OpenFoodFactsProductResponse['product'][]) {
  return products.map((product) =>
    normalizeOpenFoodFactsSearchResult({
      code: String(product?.code ?? ''),
      status: product ? 1 : 0,
      product,
    }),
  );
}

function cachedProductResponseHasCurrentCarbonFields(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  const product = (value as OpenFoodFactsProductResponse).product;
  if (!product) return false;

  return (
    'ecoscore_data' in product ||
    'carbon_footprint_percent_of_known_ingredients' in product ||
    'carbon_footprint_from_known_ingredients_100g' in product ||
    'carbon-footprint-from-known-ingredients_100g' in product ||
    'carbon_footprint_100g' in product ||
    'carbon-footprint_100g' in product
  );
}
