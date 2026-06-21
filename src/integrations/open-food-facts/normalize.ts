import type {
  NormalizedOpenFoodFactsProduct,
  OpenFoodFactsProductResponse,
  OpenFoodFactsSearchSummary,
} from './types';

const PETROL_CAR_KG_CO2E_PER_KM = 0.189;

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function splitCategories(value?: string) {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getNestedNumber(value: unknown, path: string[]): number | undefined {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return parseNumber(current);
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (parsed !== undefined) return parsed;
  }

  return undefined;
}

function getGreenScoreLabel(grade?: string) {
  if (!grade) return undefined;
  return `Green-Score ${grade.toUpperCase()}`;
}

function getEnvironmentalImpactLabel(grade?: string) {
  switch (grade?.toLowerCase()) {
    case 'a':
      return 'Very low environmental impact';
    case 'b':
      return 'Low environmental impact';
    case 'c':
      return 'Moderate environmental impact';
    case 'd':
      return 'High environmental impact';
    case 'e':
      return 'Very high environmental impact';
    default:
      return undefined;
  }
}

function extractCarbonFootprint(product: NonNullable<OpenFoodFactsProductResponse['product']>) {
  const knownIngredients100g = pickNumber(
    product.carbon_footprint_from_known_ingredients_100g,
    product['carbon-footprint-from-known-ingredients_100g'],
    product.carbon_footprint_100g,
    product['carbon-footprint_100g'],
    product.nutriments?.carbon_footprint_from_known_ingredients_100g,
    product.nutriments?.['carbon-footprint-from-known-ingredients_100g'],
    product.nutriments?.carbon_footprint_100g,
    product.nutriments?.['carbon-footprint_100g'],
  );
  const ecoscoreAgribalyseKgPerKg = getNestedNumber(product.ecoscore_data, [
    'agribalyse',
    'co2_total',
  ]);
  const gramsCo2ePer100g =
    knownIngredients100g ??
    (ecoscoreAgribalyseKgPerKg !== undefined ? ecoscoreAgribalyseKgPerKg * 100 : undefined);
  const kgCo2ePerKg =
    knownIngredients100g !== undefined
      ? Number((knownIngredients100g / 100).toFixed(6))
      : ecoscoreAgribalyseKgPerKg !== undefined
        ? Number(ecoscoreAgribalyseKgPerKg.toFixed(6))
        : undefined;
  const petrolCarKmEquivalent =
    gramsCo2ePer100g !== undefined
      ? Number((gramsCo2ePer100g / 1000 / PETROL_CAR_KG_CO2E_PER_KM).toFixed(1))
      : undefined;

  const knownIngredientsProduct = pickNumber(
    product.carbon_footprint_from_known_ingredients_product,
    product['carbon-footprint-from-known-ingredients_product'],
    product.carbon_footprint_product,
    product['carbon-footprint_product'],
  );
  const knownIngredientsServing = pickNumber(
    product.carbon_footprint_from_known_ingredients_serving,
    product['carbon-footprint-from-known-ingredients_serving'],
    product.carbon_footprint_serving,
    product['carbon-footprint_serving'],
  );

  return {
    carbonFootprintGPer100g: gramsCo2ePer100g,
    carbonFootprintKgPerKg: kgCo2ePerKg,
    carbonFootprintKgPerProduct:
      knownIngredientsProduct !== undefined
        ? Number((knownIngredientsProduct / 1000).toFixed(6))
        : undefined,
    carbonFootprintKgPerServing:
      knownIngredientsServing !== undefined
        ? Number((knownIngredientsServing / 1000).toFixed(6))
        : undefined,
    carbonFootprintPercentKnownIngredients: parseNumber(
      product.carbon_footprint_percent_of_known_ingredients,
    ),
    carbonFootprintSource:
      knownIngredients100g !== undefined || knownIngredientsProduct !== undefined || knownIngredientsServing !== undefined
        ? 'Open Food Facts known ingredients carbon footprint'
        : ecoscoreAgribalyseKgPerKg !== undefined
          ? 'Open Food Facts Agribalyse environmental data'
          : undefined,
    carbonFootprintDisplay:
      gramsCo2ePer100g !== undefined
        ? `${Number(gramsCo2ePer100g.toFixed(1))} g CO2e per 100g of product`
        : undefined,
    carbonFootprintPetrolCarKmEquivalentPer100g: petrolCarKmEquivalent,
    carbonFootprintPetrolCarEquivalentDisplay:
      petrolCarKmEquivalent !== undefined
        ? `Equal to driving ${petrolCarKmEquivalent.toFixed(1)} km in a petrol car`
        : undefined,
  };
}

export function normalizeOpenFoodFactsProduct(
  response: OpenFoodFactsProductResponse,
): NormalizedOpenFoodFactsProduct {
  const product = response.product;
  const barcode = String(response.code || product?.code || '');

  if (!product || response.status === 0) {
    return {
      barcode,
      found: false,
      categories: [],
      categoryTags: [],
      packagingTags: [],
      labelsTags: [],
      countriesTags: [],
      source: 'OPEN_FOOD_FACTS',
      rawResponse: response,
    };
  }

  const carbonFootprint = extractCarbonFootprint(product);

  return {
    barcode,
    found: true,
    productName: product.product_name || product.product_name_en || undefined,
    brand: product.brands || undefined,
    quantity: product.quantity || undefined,
    servingSize: product.serving_size || undefined,
    productQuantity: parseNumber(product.product_quantity),
    categories: splitCategories(product.categories),
    categoryTags: product.categories_tags || [],
    ingredientsText: product.ingredients_text || product.ingredients_text_en || undefined,
    nutriments: product.nutriments,
    nutriScore: product.nutriscore_grade || undefined,
    novaGroup: parseNumber(product.nova_group),
    ecoScore: product.ecoscore_grade || undefined,
    ecoScoreScore: parseNumber(product.ecoscore_score),
    environmentalScore: product.environmental_score || undefined,
    greenScoreLabel: getGreenScoreLabel(product.ecoscore_grade),
    environmentalImpactLabel: getEnvironmentalImpactLabel(product.ecoscore_grade),
    ...carbonFootprint,
    packaging: product.packaging || undefined,
    packagingTags: product.packaging_tags || [],
    labels: product.labels || undefined,
    labelsTags: product.labels_tags || [],
    countriesTags: product.countries_tags || [],
    imageUrl: product.image_url || product.image_front_url || undefined,
    source: 'OPEN_FOOD_FACTS',
    rawResponse: response,
  };
}

export function normalizeOpenFoodFactsSearchResult(
  response: OpenFoodFactsProductResponse,
): OpenFoodFactsSearchSummary {
  const product = normalizeOpenFoodFactsProduct(response);

  return {
    barcode: product.barcode,
    productName: product.productName,
    brand: product.brand,
    quantity: product.quantity,
    categories: product.categories,
    categoryTags: product.categoryTags,
    imageUrl: product.imageUrl,
    carbonFootprintKgPerKg: product.carbonFootprintKgPerKg,
  };
}
