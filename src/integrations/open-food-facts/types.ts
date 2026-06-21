export type OpenFoodFactsProductStatus = 0 | 1;

export type OpenFoodFactsProductResponse = {
  code?: string;
  status?: OpenFoodFactsProductStatus;
  status_verbose?: string;
  product?: {
    code?: string;
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    quantity?: string;
    serving_size?: string;
    product_quantity?: string | number;
    categories?: string;
    categories_tags?: string[];
    ingredients_text?: string;
    ingredients_text_en?: string;
    nutriments?: Record<string, unknown>;
    nutriscore_grade?: string;
    nova_group?: number | string;
    ecoscore_grade?: string;
    ecoscore_score?: number | string;
    environmental_score?: string;
    ecoscore_data?: Record<string, unknown>;
    carbon_footprint_percent_of_known_ingredients?: number | string;
    carbon_footprint_from_known_ingredients_product?: number | string;
    carbon_footprint_from_known_ingredients_serving?: number | string;
    carbon_footprint_from_known_ingredients_100g?: number | string;
    'carbon-footprint-from-known-ingredients_product'?: number | string;
    'carbon-footprint-from-known-ingredients_serving'?: number | string;
    'carbon-footprint-from-known-ingredients_100g'?: number | string;
    carbon_footprint_product?: number | string;
    carbon_footprint_serving?: number | string;
    carbon_footprint_100g?: number | string;
    'carbon-footprint_product'?: number | string;
    'carbon-footprint_serving'?: number | string;
    'carbon-footprint_100g'?: number | string;
    packaging?: string;
    packaging_tags?: string[];
    labels?: string;
    labels_tags?: string[];
    countries_tags?: string[];
    image_url?: string;
    image_front_url?: string;
    [key: string]: unknown;
  };
};

export type NormalizedOpenFoodFactsProduct = {
  barcode: string;
  found: boolean;
  productName?: string;
  brand?: string;
  quantity?: string;
  servingSize?: string;
  productQuantity?: number;
  categories: string[];
  categoryTags: string[];
  ingredientsText?: string;
  nutriments?: Record<string, unknown>;
  nutriScore?: string;
  novaGroup?: number;
  ecoScore?: string;
  ecoScoreScore?: number;
  environmentalScore?: string;
  greenScoreLabel?: string;
  environmentalImpactLabel?: string;
  carbonFootprintGPer100g?: number;
  carbonFootprintKgPerKg?: number;
  carbonFootprintKgPerServing?: number;
  carbonFootprintKgPerProduct?: number;
  carbonFootprintPercentKnownIngredients?: number;
  carbonFootprintSource?: string;
  carbonFootprintDisplay?: string;
  carbonFootprintPetrolCarKmEquivalentPer100g?: number;
  carbonFootprintPetrolCarEquivalentDisplay?: string;
  packaging?: string;
  packagingTags: string[];
  labels?: string;
  labelsTags: string[];
  countriesTags: string[];
  imageUrl?: string;
  source: 'OPEN_FOOD_FACTS';
  rawResponse: unknown;
};

export type OpenFoodFactsSearchSummary = {
  barcode: string;
  productName?: string;
  brand?: string;
  quantity?: string;
  categories: string[];
  categoryTags: string[];
  imageUrl?: string;
  carbonFootprintKgPerKg?: number;
};

export type ProductCarbonEstimateStatus =
  | 'ESTIMATED'
  | 'NO_PRODUCT_FOUND'
  | 'NO_CATEGORY_MAPPING'
  | 'MISSING_QUANTITY'
  | 'UNSUPPORTED_PRODUCT'
  | 'ERROR';

export type ProductCarbonEstimateResult = {
  status: ProductCarbonEstimateStatus;
  co2eKg?: number;
  provider?: 'CLIMATIQ' | 'AGRIBALYSE' | 'MANUAL' | 'OPEN_FOOD_FACTS';
  factorLabel?: string;
  factorSource?: string;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  message?: string;
  metadata?: Record<string, unknown>;
};
