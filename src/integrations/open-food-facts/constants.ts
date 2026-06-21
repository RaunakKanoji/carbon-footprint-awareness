export const OPEN_FOOD_FACTS_PROVIDER = 'OPEN_FOOD_FACTS' as const;

export const OPEN_FOOD_FACTS_ENDPOINTS = {
  productByBarcode: (barcode: string) => `/api/v2/product/${barcode}`,
  search: '/cgi/search.pl',
};

export const OPEN_FOOD_FACTS_PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'serving_size',
  'product_quantity',
  'categories',
  'categories_tags',
  'ingredients_text',
  'ingredients_text_en',
  'nutriments',
  'nutriscore_grade',
  'nova_group',
  'ecoscore_grade',
  'ecoscore_score',
  'environmental_score',
  'ecoscore_data',
  'carbon_footprint_percent_of_known_ingredients',
  'carbon_footprint_from_known_ingredients_product',
  'carbon_footprint_from_known_ingredients_serving',
  'carbon_footprint_from_known_ingredients_100g',
  'carbon-footprint-from-known-ingredients_product',
  'carbon-footprint-from-known-ingredients_serving',
  'carbon-footprint-from-known-ingredients_100g',
  'carbon_footprint_product',
  'carbon_footprint_serving',
  'carbon_footprint_100g',
  'carbon-footprint_product',
  'carbon-footprint_serving',
  'carbon-footprint_100g',
  'packaging',
  'packaging_tags',
  'labels',
  'labels_tags',
  'countries_tags',
  'image_url',
  'image_front_url',
].join(',');

export const PRODUCT_LOOKUP_CACHE_DAYS = 7;
export const PRODUCT_SEARCH_CACHE_DAYS = 1;

export function isOpenFoodFactsPlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}

export function getOpenFoodFactsEndpointStatus() {
  return [
    { endpoint: 'productByBarcode', configured: true },
    { endpoint: 'search', configured: true },
  ];
}
