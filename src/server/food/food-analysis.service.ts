import 'server-only';

import { prisma } from '@/src/db/prisma';
import type { CarbonEstimateConfidence, Prisma } from '@/src/generated/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';

import { searchAgribalyseFoodFactors } from './agribalyse-search.service';

type IngredientInput = {
  name: string;
  quantityKg: number;
};

type IngredientEstimate = IngredientInput & {
  co2eKg: number;
  factorKgCo2ePerKg: number;
  factorId?: string;
  factorName?: string;
  provider: 'AGRIBALYSE' | 'INTERNAL';
  confidence: CarbonEstimateConfidence;
};

export type FoodAnalysisResult = {
  name: string;
  description?: string;
  servings: number;
  quantityKg: number;
  cookingMinutes?: number;
  ingredients: IngredientEstimate[];
  totalCo2eKg: number;
  confidence: CarbonEstimateConfidence;
  dataSources: string[];
  mode: 'POPULAR' | 'BARCODE' | 'RECENT' | 'AI';
  catalogItemId?: string;
  foodProductId?: string;
  analysis?: Record<string, unknown>;
};

const INTERNAL_INGREDIENT_FACTORS: Record<string, number> = {
  rice: 2.7,
  wheat: 1.4,
  corn: 1.0,
  maize: 1.0,
  potato: 0.45,
  tomato: 0.7,
  onion: 0.5,
  vegetables: 0.6,
  lentil: 0.9,
  dal: 0.9,
  chickpea: 0.8,
  beans: 0.9,
  milk: 1.4,
  butter: 12,
  cream: 5.5,
  cheese: 8.5,
  paneer: 5.8,
  egg: 4.5,
  chicken: 6.9,
  fish: 5,
  beef: 27,
  lamb: 24,
  oil: 3.5,
  sugar: 0.7,
  spice: 1.5,
};

const POPULAR_FOODS: Array<{
  slug: string;
  name: string;
  description: string;
  dietType: string;
  servingSizeKg: number;
  ingredients: Array<{ name: string; share: number }>;
}> = [
  {
    slug: 'dal-rice',
    name: 'Dal rice',
    description: 'Cooked rice served with seasoned lentils.',
    dietType: 'vegetarian',
    servingSizeKg: 0.45,
    ingredients: [
      { name: 'rice', share: 0.55 },
      { name: 'lentils', share: 0.3 },
      { name: 'onion', share: 0.05 },
      { name: 'tomato', share: 0.05 },
      { name: 'vegetable oil', share: 0.05 },
    ],
  },
  {
    slug: 'vegetarian-thali',
    name: 'Vegetarian thali',
    description: 'Rice, wheat bread, dal, vegetables, and curd.',
    dietType: 'vegetarian',
    servingSizeKg: 0.65,
    ingredients: [
      { name: 'rice', share: 0.25 },
      { name: 'wheat', share: 0.2 },
      { name: 'lentils', share: 0.2 },
      { name: 'vegetables', share: 0.25 },
      { name: 'milk yogurt', share: 0.1 },
    ],
  },
  {
    slug: 'paneer-meal',
    name: 'Paneer meal',
    description: 'Paneer curry with rice or flatbread.',
    dietType: 'vegetarian',
    servingSizeKg: 0.45,
    ingredients: [
      { name: 'paneer cheese', share: 0.3 },
      { name: 'rice', share: 0.35 },
      { name: 'tomato', share: 0.15 },
      { name: 'onion', share: 0.1 },
      { name: 'cream', share: 0.05 },
      { name: 'vegetable oil', share: 0.05 },
    ],
  },
  {
    slug: 'poha',
    name: 'Poha',
    description: 'Flattened rice cooked with vegetables and spices.',
    dietType: 'vegan',
    servingSizeKg: 0.3,
    ingredients: [
      { name: 'rice', share: 0.65 },
      { name: 'onion', share: 0.1 },
      { name: 'potato', share: 0.15 },
      { name: 'vegetable oil', share: 0.05 },
      { name: 'spices', share: 0.05 },
    ],
  },
  {
    slug: 'chicken-biryani',
    name: 'Chicken biryani',
    description: 'Spiced rice cooked with chicken.',
    dietType: 'nonVegetarian',
    servingSizeKg: 0.45,
    ingredients: [
      { name: 'rice', share: 0.5 },
      { name: 'chicken', share: 0.3 },
      { name: 'onion', share: 0.08 },
      { name: 'milk yogurt', share: 0.05 },
      { name: 'vegetable oil', share: 0.04 },
      { name: 'spices', share: 0.03 },
    ],
  },
  {
    slug: 'butter-chicken',
    name: 'Butter chicken',
    description: 'Chicken cooked in a tomato, butter, and cream sauce.',
    dietType: 'nonVegetarian',
    servingSizeKg: 0.4,
    ingredients: [
      { name: 'chicken', share: 0.5 },
      { name: 'tomato', share: 0.2 },
      { name: 'butter', share: 0.08 },
      { name: 'cream', share: 0.08 },
      { name: 'onion', share: 0.07 },
      { name: 'spices', share: 0.04 },
      { name: 'vegetable oil', share: 0.03 },
    ],
  },
];

function internalFactor(name: string) {
  const normalized = name.toLowerCase();
  const entry = Object.entries(INTERNAL_INGREDIENT_FACTORS).find(([key]) =>
    normalized.includes(key),
  );
  return entry?.[1] ?? 2.5;
}

async function estimateIngredient(ingredient: IngredientInput): Promise<IngredientEstimate> {
  const candidates = await searchAgribalyseFoodFactors({
    query: ingredient.name,
    limit: 8,
  }).catch(() => []);
  const normalizedName = ingredient.name.toLowerCase();
  const factor =
    candidates.find((candidate) => candidate.name.toLowerCase().includes(normalizedName)) ??
    candidates[0];

  if (factor) {
    const co2eKg = ingredient.quantityKg * factor.climateChangeKgCo2ePerKg;
    return {
      ...ingredient,
      co2eKg: Number(co2eKg.toFixed(3)),
      factorKgCo2ePerKg: factor.climateChangeKgCo2ePerKg,
      factorId: factor.id,
      factorName: factor.name,
      provider: 'AGRIBALYSE',
      confidence: 'HIGH',
    };
  }

  const factorKgCo2ePerKg = internalFactor(ingredient.name);
  return {
    ...ingredient,
    co2eKg: Number((ingredient.quantityKg * factorKgCo2ePerKg).toFixed(3)),
    factorKgCo2ePerKg,
    provider: 'INTERNAL',
    confidence: 'LOW',
  };
}

async function analyzeIngredients(input: {
  name: string;
  description?: string;
  servings: number;
  ingredients: IngredientInput[];
  cookingMinutes?: number;
  mode: FoodAnalysisResult['mode'];
  catalogItemId?: string;
  foodProductId?: string;
  analysis?: Record<string, unknown>;
}): Promise<FoodAnalysisResult> {
  const ingredients = await Promise.all(input.ingredients.map(estimateIngredient));
  const quantityKg = ingredients.reduce((sum, ingredient) => sum + ingredient.quantityKg, 0);
  const totalCo2eKg = ingredients.reduce((sum, ingredient) => sum + ingredient.co2eKg, 0);
  const agribalyseCount = ingredients.filter(
    (ingredient) => ingredient.provider === 'AGRIBALYSE',
  ).length;
  const confidence: CarbonEstimateConfidence =
    agribalyseCount === ingredients.length ? 'HIGH' : agribalyseCount > 0 ? 'MEDIUM' : 'LOW';

  return {
    ...input,
    quantityKg: Number(quantityKg.toFixed(3)),
    ingredients,
    totalCo2eKg: Number(totalCo2eKg.toFixed(3)),
    confidence,
    dataSources:
      agribalyseCount > 0
        ? ['AGRIBALYSE', 'Carbon Compass ingredient factors']
        : ['Carbon Compass ingredient factors'],
  };
}

export async function ensurePopularFoodCatalog() {
  for (const item of POPULAR_FOODS) {
    const ingredients = item.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantityKg: Number((item.servingSizeKg * ingredient.share).toFixed(4)),
    }));
    const analysis = await analyzeIngredients({
      name: item.name,
      description: item.description,
      servings: 1,
      ingredients,
      mode: 'POPULAR',
    });

    await prisma.foodCatalogItem.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        dietType: item.dietType,
        servingSizeKg: item.servingSizeKg,
        ingredients: analysis.ingredients as unknown as Prisma.InputJsonValue,
        totalCo2eKg: analysis.totalCo2eKg,
        confidence: analysis.confidence,
        dataSources: analysis.dataSources,
      },
      update: {
        description: item.description,
        dietType: item.dietType,
        servingSizeKg: item.servingSizeKg,
        ingredients: analysis.ingredients as unknown as Prisma.InputJsonValue,
        totalCo2eKg: analysis.totalCo2eKg,
        confidence: analysis.confidence,
        dataSources: analysis.dataSources,
      },
    });
  }
}

export async function listPopularFoods(input: { query?: string; dietType?: string }) {
  await ensurePopularFoodCatalog();
  return prisma.foodCatalogItem.findMany({
    where: {
      isActive: true,
      isPopular: true,
      dietType: input.dietType || undefined,
      name: input.query ? { contains: input.query.trim(), mode: 'insensitive' } : undefined,
    },
    orderBy: { name: 'asc' },
  });
}

async function analyzePopularFood(catalogItemId: string, servings: number) {
  const item = await prisma.foodCatalogItem.findFirst({
    where: { id: catalogItemId, isActive: true },
  });
  if (!item) throw new Error('Food catalog item not found.');

  const ingredients = (item.ingredients as unknown as IngredientEstimate[]).map((ingredient) => ({
    name: ingredient.name,
    quantityKg: ingredient.quantityKg * servings,
  }));
  return analyzeIngredients({
    name: item.name,
    description: item.description ?? undefined,
    servings,
    ingredients,
    mode: 'POPULAR',
    catalogItemId: item.id,
  });
}

async function analyzeBarcode(barcode: string, quantityKg?: number) {
  const { product } = await getProductByBarcode({ barcode });
  if (!product.found) throw new Error('No Open Food Facts product was found for this barcode.');

  const storedProduct = await prisma.foodProduct.findUnique({
    where: { barcode: product.barcode },
  });
  const totalQuantityKg =
    quantityKg ?? (product.productQuantity ? product.productQuantity / 1000 : undefined) ?? 0.25;
  const ingredientNames = (product.ingredientsText ?? product.productName ?? 'packaged food')
    .split(/[,;()]/)
    .map((name) => name.replace(/\d+(?:[.,]\d+)?%/g, '').trim())
    .filter((name) => name.length > 2)
    .slice(0, 12);
  const names = ingredientNames.length > 0 ? ingredientNames : [product.productName ?? 'food'];
  const quantityPerIngredient = totalQuantityKg / names.length;

  return analyzeIngredients({
    name: product.productName ?? `Product ${product.barcode}`,
    description: [product.brand, product.quantity].filter(Boolean).join(' · '),
    servings: 1,
    ingredients: names.map((name) => ({ name, quantityKg: quantityPerIngredient })),
    mode: 'BARCODE',
    foodProductId: storedProduct?.id,
    analysis: {
      barcode: product.barcode,
      brand: product.brand,
      categories: product.categories,
      openFoodFactsCarbonKgPerKg: product.carbonFootprintKgPerKg,
    },
  });
}

async function requestAiMeal(description: string, servings: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Configure GEMINI_API_KEY to use AI Meals.');
  }

  const schema = {
    type: 'object',
    required: ['name', 'description', 'servings', 'cooking_minutes', 'ingredients'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      servings: { type: 'number' },
      cooking_minutes: { type: 'number' },
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'quantity_kg'],
          properties: {
            name: { type: 'string' },
            quantity_kg: { type: 'number' },
          },
        },
      },
    },
  };
  const prompt = `Decompose this prepared food into realistic edible ingredients and weights in kilograms: "${description}". Estimate ${servings} serving(s). Return no commentary.`;
  const model = process.env.GEMINI_FOOD_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      }),
    },
  );
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(payload.error?.message ?? 'Gemini meal analysis failed.');

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
  if (!text) throw new Error('Gemini returned no meal analysis.');

  return JSON.parse(text) as {
    name: string;
    description: string;
    servings: number;
    cooking_minutes: number;
    ingredients: Array<{ name: string; quantity_kg: number }>;
  };
}

async function analyzeAiMeal(description: string, servings: number) {
  const meal = await requestAiMeal(description, servings);
  return analyzeIngredients({
    name: meal.name,
    description: meal.description,
    servings: meal.servings,
    cookingMinutes: meal.cooking_minutes,
    ingredients: meal.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantityKg: ingredient.quantity_kg,
    })),
    mode: 'AI',
    analysis: meal as unknown as Record<string, unknown>,
  });
}

export async function getRecentFoodLogs(userId: string, limit = 12) {
  return prisma.userFoodLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(30, Math.max(1, limit)),
  });
}

export async function analyzeFood(
  input:
    | { mode: 'POPULAR'; catalogItemId: string; servings: number }
    | { mode: 'BARCODE'; barcode: string; quantityKg?: number }
    | { mode: 'RECENT'; foodLogId: string; servings: number; userId: string }
    | { mode: 'AI'; description: string; servings: number },
) {
  if (input.mode === 'POPULAR') {
    return analyzePopularFood(input.catalogItemId, input.servings);
  }
  if (input.mode === 'BARCODE') {
    return analyzeBarcode(input.barcode, input.quantityKg);
  }
  if (input.mode === 'AI') {
    return analyzeAiMeal(input.description, input.servings);
  }

  const recent = await prisma.userFoodLog.findFirst({
    where: { id: input.foodLogId, userId: input.userId },
  });
  if (!recent) throw new Error('Recent food log not found.');
  const previousIngredients = recent.ingredients as unknown as IngredientEstimate[];
  const multiplier = input.servings / recent.servings;
  return analyzeIngredients({
    name: recent.name,
    description: recent.description ?? undefined,
    servings: input.servings,
    ingredients: previousIngredients.map((ingredient) => ({
      name: ingredient.name,
      quantityKg: ingredient.quantityKg * multiplier,
    })),
    mode: 'RECENT',
    catalogItemId: recent.catalogItemId ?? undefined,
    foodProductId: recent.foodProductId ?? undefined,
    analysis: { repeatedFromFoodLogId: recent.id },
  });
}

export async function saveFoodAnalysis(input: {
  userId: string;
  result: FoodAnalysisResult;
  occurredAt?: Date;
  note?: string;
}) {
  const primaryIngredient = [...input.result.ingredients].sort((a, b) => b.co2eKg - a.co2eKg)[0];
  const activity = await prisma.activityLog.create({
    data: {
      userId: input.userId,
      category: 'FOOD',
      subType: 'preparedFood',
      activityType: input.result.name,
      quantity: input.result.servings,
      unit: 'serving',
      weightValue: input.result.quantityKg,
      weightUnit: 'kg',
      co2eKg: input.result.totalCo2eKg,
      provider: input.result.dataSources.includes('AGRIBALYSE') ? 'AGRIBALYSE' : 'INTERNAL',
      confidence: input.result.confidence,
      fallbackUsed: input.result.ingredients.some(
        (ingredient) => ingredient.provider === 'INTERNAL',
      ),
      calculationMethod: 'ingredient_level_food_analysis',
      sourcePayload: {
        mode: input.result.mode,
        ingredients: input.result.ingredients,
      } as unknown as Prisma.InputJsonValue,
      sourceFactorId: primaryIngredient?.factorId,
      sourceDataset: input.result.dataSources.join(', '),
      factorUsed: primaryIngredient?.factorKgCo2ePerKg,
      note: input.note,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });

  const foodLog = await prisma.userFoodLog.create({
    data: {
      userId: input.userId,
      catalogItemId: input.result.catalogItemId,
      foodProductId: input.result.foodProductId,
      activityLogId: activity.id,
      mode: input.result.mode,
      name: input.result.name,
      description: input.result.description,
      servings: input.result.servings,
      quantityKg: input.result.quantityKg,
      ingredients: input.result.ingredients as unknown as Prisma.InputJsonValue,
      totalCo2eKg: input.result.totalCo2eKg,
      confidence: input.result.confidence,
      dataSources: input.result.dataSources,
      analysis: input.result.analysis as Prisma.InputJsonValue | undefined,
    },
  });

  await handleNewActivityLog(activity);

  return { activity, foodLog };
}
