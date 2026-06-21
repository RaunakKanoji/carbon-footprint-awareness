You are a senior full-stack engineer working on my carbon footprint tracker app called **Carbon Compass AI**.

The app stack is:

* Next.js / React
* TypeScript
* Prisma
* PostgreSQL
* Clerk authentication
* Tailwind CSS
* shadcn-style UI components
* Existing carbon providers:

  * CarbonSutra
  * Carbon Interface
  * Climatiq
* Existing dashboard, activity tracking, gamification, and carbon progress features

Your task is to implement **Open Food Facts** as the app’s barcode scanning, food product lookup, product metadata, food-category mapping, and product-to-carbon input layer.

Open Food Facts should not be treated as the only carbon calculation engine.

Open Food Facts should identify products and provide metadata. Carbon emissions should be calculated using:

* Climatiq
* Agribalyse dataset if available
* app-owned fallback food emission factor table
* manual category-based factors where necessary

Do not redesign the app.
Do not change the existing color palette.
Do not change existing fonts.
Do not change unrelated components.
Do not break authentication.
Do not break the database.
Do not expose unnecessary implementation details to the normal user.
Do not overcomplicate the MVP.

---

# 1. Main objective

Implement this complete product scan flow:

User scans or enters barcode
→ frontend sends barcode to internal backend route
→ backend validates barcode
→ backend calls Open Food Facts product lookup
→ backend normalizes product data
→ backend caches product data
→ backend maps product category to a carbon factor or Climatiq mapping
→ backend estimates food/product carbon if enough data exists
→ backend stores scan/product log
→ dashboard can show product or food-related carbon activity

Open Food Facts must never be called directly from client components for production app usage.

All Open Food Facts calls should go through backend API routes so the app can:

* cache product results
* respect rate limits
* normalize product data
* add product-to-carbon logic
* avoid exposing internal app logic
* keep scan history user-specific

---

# 2. What Open Food Facts should handle

Use Open Food Facts for:

```txt
Barcode lookup
Food product identification
Product name
Brand
Category
Quantity
Serving size
Ingredients
Nutriments
Nutri-Score
NOVA group
Eco-Score / environmental metadata if available
Packaging information
Labels
Country availability
Product image
Product category tags
```

Do not use Open Food Facts as the only source for:

```txt
Final kg CO₂e calculation
Transport footprint
Electricity footprint
Fuel footprint
Flight footprint
Route distance
AI recommendations
```

Those are handled by:

```txt
CarbonSutra / Carbon Interface / Climatiq = carbon calculation
OpenRouteService = distance and route metadata
OpenAI = explanations, recommendations, parsing, and missions
Electricity Maps = live grid intensity
Agribalyse / app factor table = food LCA estimates
```

---

# 3. Key implementation principle

Open Food Facts should produce this normalized object:

```ts
{
  barcode: string;
  productName: string;
  brand?: string;
  quantity?: string;
  servingSize?: string;
  categories: string[];
  categoryTags: string[];
  ingredientsText?: string;
  nutriments?: object;
  nutriScore?: string;
  novaGroup?: number;
  ecoScore?: string;
  ecoScoreScore?: number;
  packagingTags: string[];
  labelsTags: string[];
  imageUrl?: string;
  source: "OPEN_FOOD_FACTS";
}
```

Then the app should decide:

```txt
Can this product be carbon-estimated?
→ yes: map category/weight to Climatiq/Agribalyse/manual factor
→ no: save product scan with "carbon estimate unavailable"
```

Do not invent carbon numbers.

If product carbon data is not available, return a clear status:

```txt
Carbon estimate unavailable for this product. We found product metadata, but no reliable emission factor mapping yet.
```

---

# 4. Environment variables

Add support for:

```env
OPEN_FOOD_FACTS_BASE_URL=https://world.openfoodfacts.org
OPEN_FOOD_FACTS_USER_AGENT=CarbonCompassAI/1.0 (contact: your-email@example.com)
ENABLE_DEV_API_PLAYGROUND=true
```

Add to `.env.example`:

```env
OPEN_FOOD_FACTS_BASE_URL=https://world.openfoodfacts.org
OPEN_FOOD_FACTS_USER_AGENT=CarbonCompassAI/1.0 (contact: your-email@example.com)
ENABLE_DEV_API_PLAYGROUND=false
```

Rules:

* Open Food Facts does not require an API key for public read product lookup.
* Still call Open Food Facts from backend routes.
* Always send a custom `User-Agent`.
* Do not use Open Food Facts for search-as-you-type.
* Cache product lookup responses to respect rate limits.
* Do not expose raw product payloads on the normal dashboard.

---

# 5. Required folder structure

Create or update this structure:

```txt
src/
  app/
    api/
      products/
        barcode/
          [barcode]/
            route.ts
        search/
          route.ts
        scan/
          route.ts
        estimate-carbon/
          route.ts
        recent/
          route.ts

      dev/
        open-food-facts/
          config/
            route.ts
          test/
            route.ts
          product/
            route.ts
          search/
            route.ts
          category-mappings/
            route.ts

    dev/
      open-food-facts-playground/
        page.tsx

  lib/
    open-food-facts/
      client.ts
      constants.ts
      types.ts
      normalize.ts
      cache.ts
      validators.ts
      category-mapping.ts
      payload-builders.ts

  server/
    products/
      open-food-facts.service.ts
      product-scan.service.ts
      product-carbon.service.ts
      food-factor-mapping.service.ts

  components/
    products/
      BarcodeScanner.tsx
      BarcodeManualInput.tsx
      ProductLookupCard.tsx
      ProductCarbonEstimateCard.tsx
      ProductScanHistory.tsx
      ProductCategoryMappingNotice.tsx

    dev/
      OpenFoodFactsPlayground.tsx
      OpenFoodFactsProductTester.tsx
      OpenFoodFactsSearchTester.tsx
      OpenFoodFactsCategoryMappingPanel.tsx
      JsonResponseViewer.tsx
```

If the existing project has a different convention, follow the existing project convention, but keep the separation between:

* client
* types
* normalization
* services
* API routes
* database models
* UI components
* developer playground

---

# 6. Prisma schema requirements

Add or update these models.

## FoodProduct

```prisma
model FoodProduct {
  id              String   @id @default(cuid())

  barcode         String   @unique
  productName     String?
  brand           String?
  quantity        String?
  servingSize     String?

  categories      Json?
  categoryTags    Json?
  ingredientsText String?
  nutriments      Json?

  nutriScore      String?
  novaGroup       Int?
  ecoScore        String?
  ecoScoreScore   Float?

  packagingTags   Json?
  labelsTags      Json?
  countriesTags   Json?

  imageUrl        String?

  source          String   @default("OPEN_FOOD_FACTS")
  sourceResponse  Json?

  lastFetchedAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([barcode])
  @@index([source])
}
```

## ProductScan

```prisma
model ProductScan {
  id              String   @id @default(cuid())
  userId          String

  barcode         String
  foodProductId   String?

  productName     String?
  brand           String?
  imageUrl        String?

  scanSource      String   @default("BARCODE") // BARCODE, MANUAL, SEARCH, RECEIPT
  scanContext     String?  // MEAL_LOG, SHOPPING, PANTRY, RECEIPT, POINT_OF_PURCHASE

  carbonEstimated Boolean  @default(false)
  activityLogId    String?

  metadata         Json?

  createdAt        DateTime @default(now())

  @@index([userId])
  @@index([barcode])
  @@index([scanContext])
  @@index([createdAt])
}
```

## FoodCarbonFactorMapping

```prisma
model FoodCarbonFactorMapping {
  id                String   @id @default(cuid())

  provider          String   // CLIMATIQ, AGRIBALYSE, MANUAL
  appCategory       String
  openFoodFactsTag  String?

  label             String
  description       String?

  climatiqActivityId String?
  climatiqFactorId   String?
  climatiqDataVersion String?
  climatiqRegion     String?

  agribalyseId       String?
  manualCo2ePerKg    Float?

  unitType           String   @default("Weight")
  defaultWeightKg    Float?

  confidence         String   @default("MEDIUM")
  metadata           Json?

  isActive           Boolean  @default(true)

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([provider])
  @@index([appCategory])
  @@index([openFoodFactsTag])
  @@index([isActive])
}
```

## ProductLookupCache

```prisma
model ProductLookupCache {
  id             String   @id @default(cuid())

  provider       String   @default("OPEN_FOOD_FACTS")
  endpoint       String
  cacheKey       String   @unique

  barcode        String?
  query          String?

  sourcePayload  Json?
  sourceResponse Json

  expiresAt      DateTime?
  createdAt      DateTime @default(now())

  @@index([provider])
  @@index([endpoint])
  @@index([barcode])
  @@index([createdAt])
  @@index([expiresAt])
}
```

If the existing `ActivityLog` model exists, update it to support food/product activity logs if needed:

```prisma
enum ActivityCategory {
  TRANSPORT
  ELECTRICITY
  FLIGHT
  FUEL
  HOTEL
  SHIPPING
  FOOD
  SHOPPING
  PRODUCT
  MATERIAL
  RECYCLING
}
```

ActivityLog should already have:

```prisma
co2eKg
provider
sourceEndpoint
sourcePayload
sourceResponse
sourceFactorId
sourceActivityId
confidence
calculationMethod
```

After schema update:

```bash
npx prisma format
npx prisma migrate dev
npx prisma generate
```

---

# 7. Open Food Facts constants

Create:

`src/lib/open-food-facts/constants.ts`

```ts
export const OPEN_FOOD_FACTS_PROVIDER = "OPEN_FOOD_FACTS" as const;

export const OPEN_FOOD_FACTS_ENDPOINTS = {
  productByBarcode: (barcode: string) => `/api/v2/product/${barcode}`,
  search: "/cgi/search.pl",
};

export const OPEN_FOOD_FACTS_PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "quantity",
  "serving_size",
  "product_quantity",
  "categories",
  "categories_tags",
  "ingredients_text",
  "ingredients_text_en",
  "nutriments",
  "nutriscore_grade",
  "nova_group",
  "ecoscore_grade",
  "ecoscore_score",
  "environmental_score",
  "packaging",
  "packaging_tags",
  "labels",
  "labels_tags",
  "countries_tags",
  "image_url",
  "image_front_url",
].join(",");

export const PRODUCT_LOOKUP_CACHE_DAYS = 7;
export const PRODUCT_SEARCH_CACHE_DAYS = 1;
```

---

# 8. Open Food Facts types

Create:

`src/lib/open-food-facts/types.ts`

```ts
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

  packaging?: string;
  packagingTags: string[];

  labels?: string;
  labelsTags: string[];

  countriesTags: string[];

  imageUrl?: string;

  source: "OPEN_FOOD_FACTS";
  rawResponse: unknown;
};

export type ProductCarbonEstimateStatus =
  | "ESTIMATED"
  | "NO_PRODUCT_FOUND"
  | "NO_CATEGORY_MAPPING"
  | "MISSING_QUANTITY"
  | "UNSUPPORTED_PRODUCT"
  | "ERROR";

export type ProductCarbonEstimateResult = {
  status: ProductCarbonEstimateStatus;
  co2eKg?: number;
  provider?: "CLIMATIQ" | "AGRIBALYSE" | "MANUAL";
  factorLabel?: string;
  factorSource?: string;
  confidence?: "LOW" | "MEDIUM" | "HIGH";
  message?: string;
  metadata?: Record<string, unknown>;
};
```

---

# 9. Barcode validation

Create:

`src/lib/open-food-facts/validators.ts`

```ts
export function normalizeBarcode(input: string) {
  return input.replace(/\s+/g, "").trim();
}

export function isValidBarcode(input: string) {
  const barcode = normalizeBarcode(input);

  if (!/^\d+$/.test(barcode)) return false;

  return barcode.length >= 8 && barcode.length <= 14;
}
```

Use this validation for:

```txt
EAN-8
UPC-A
EAN-13
GTIN-14
```

Do not make the validator too strict for MVP because product databases can contain different valid barcode lengths.

---

# 10. Open Food Facts client

Create:

`src/lib/open-food-facts/client.ts`

Requirements:

* Server-side only.
* Uses `fetch`.
* Reads base URL and user agent from env variables.
* Supports `GET`.
* Sends custom `User-Agent`.
* Uses `cache: "no-store"` because app-level database cache handles caching.
* Throws useful errors.
* Returns raw JSON response.

Implementation:

```ts
import "server-only";

type OpenFoodFactsRequestOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(
  baseUrl: string,
  path: string,
  query?: OpenFoodFactsRequestOptions["query"]
) {
  const url = new URL(`${baseUrl}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function callOpenFoodFacts({
  path,
  query,
}: OpenFoodFactsRequestOptions) {
  const baseUrl =
    process.env.OPEN_FOOD_FACTS_BASE_URL || "https://world.openfoodfacts.org";

  const userAgent = process.env.OPEN_FOOD_FACTS_USER_AGENT;

  if (!userAgent) {
    throw new Error("Missing OPEN_FOOD_FACTS_USER_AGENT environment variable");
  }

  const url = buildUrl(baseUrl, path, query);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Open Food Facts request failed", {
      status: response.status,
      path,
      query,
      response: data,
    });

    throw new Error(
      `Open Food Facts request failed with status ${response.status}`
    );
  }

  return data;
}
```

---

# 11. Normalization

Create:

`src/lib/open-food-facts/normalize.ts`

```ts
import type {
  OpenFoodFactsProductResponse,
  NormalizedOpenFoodFactsProduct,
} from "./types";

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function splitCategories(value?: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeOpenFoodFactsProduct(
  response: OpenFoodFactsProductResponse
): NormalizedOpenFoodFactsProduct {
  const product = response.product;

  const barcode = String(response.code || product?.code || "");

  if (!product || response.status === 0) {
    return {
      barcode,
      found: false,
      categories: [],
      categoryTags: [],
      packagingTags: [],
      labelsTags: [],
      countriesTags: [],
      source: "OPEN_FOOD_FACTS",
      rawResponse: response,
    };
  }

  return {
    barcode,
    found: true,

    productName:
      product.product_name ||
      product.product_name_en ||
      undefined,

    brand: product.brands || undefined,
    quantity: product.quantity || undefined,
    servingSize: product.serving_size || undefined,
    productQuantity: parseNumber(product.product_quantity),

    categories: splitCategories(product.categories),
    categoryTags: product.categories_tags || [],

    ingredientsText:
      product.ingredients_text ||
      product.ingredients_text_en ||
      undefined,

    nutriments: product.nutriments,

    nutriScore: product.nutriscore_grade || undefined,
    novaGroup: parseNumber(product.nova_group),
    ecoScore: product.ecoscore_grade || undefined,
    ecoScoreScore: parseNumber(product.ecoscore_score),
    environmentalScore: product.environmental_score || undefined,

    packaging: product.packaging || undefined,
    packagingTags: product.packaging_tags || [],

    labels: product.labels || undefined,
    labelsTags: product.labels_tags || [],

    countriesTags: product.countries_tags || [],

    imageUrl:
      product.image_url ||
      product.image_front_url ||
      undefined,

    source: "OPEN_FOOD_FACTS",
    rawResponse: response,
  };
}
```

---

# 12. Cache helper

Create:

`src/lib/open-food-facts/cache.ts`

```ts
import crypto from "crypto";

export function createOpenFoodFactsCacheKey(input: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}

export function getCacheExpiryDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
```

Caching strategy:

```txt
Product barcode lookup: cache for 7 days
Search results: cache for 1 day
Category mappings: database-driven, no external cache needed
```

If a cached product exists and is not expired, return cached data instead of calling Open Food Facts.

---

# 13. Open Food Facts service

Create:

`src/server/products/open-food-facts.service.ts`

Implement:

```ts
getProductByBarcode()
searchOpenFoodFactsProducts()
getOrFetchProductByBarcode()
saveNormalizedFoodProduct()
```

## getProductByBarcode

Input:

```ts
{
  barcode: string;
  useCache?: boolean;
}
```

Flow:

```txt
1. Normalize barcode.
2. Validate barcode.
3. Check ProductLookupCache.
4. If valid cached response exists, normalize and return from cache.
5. If cache miss, call Open Food Facts product endpoint.
6. Normalize response.
7. Save raw response to ProductLookupCache.
8. Save or update FoodProduct.
9. Return normalized product.
```

Call:

```txt
GET /api/v2/product/{barcode}
```

Query:

```ts
{
  fields: OPEN_FOOD_FACTS_PRODUCT_FIELDS
}
```

## searchOpenFoodFactsProducts

Input:

```ts
{
  query: string;
  page?: number;
  pageSize?: number;
}
```

Flow:

```txt
1. Validate query.
2. Do not support search-as-you-type.
3. Check cache.
4. Call Open Food Facts search.
5. Return normalized summary results.
```

Use search only for deliberate user searches, not each keystroke.

---

# 14. Product scan service

Create:

`src/server/products/product-scan.service.ts`

Implement:

```ts
recordProductScan()
getRecentProductScans()
deleteProductScan()
```

## recordProductScan

Input:

```ts
{
  userId: string;
  barcode: string;
  scanSource?: "BARCODE" | "MANUAL" | "SEARCH" | "RECEIPT";
  scanContext?: "MEAL_LOG" | "SHOPPING" | "PANTRY" | "RECEIPT" | "POINT_OF_PURCHASE";
}
```

Flow:

```txt
1. Fetch product by barcode.
2. Save ProductScan.
3. Do not automatically create ActivityLog unless carbon estimate succeeds.
4. Return product + scan.
```

---

# 15. Product carbon service

Create:

`src/server/products/product-carbon.service.ts`

Implement:

```ts
estimateProductCarbon()
findBestFoodCategoryMapping()
estimateUsingClimatiq()
estimateUsingManualFactor()
estimateUsingAgribalyseIfAvailable()
```

## Product carbon logic

Input:

```ts
{
  userId: string;
  barcode: string;
  quantityKg?: number;
  servings?: number;
  scanContext?: string;
  createActivityLog?: boolean;
}
```

Flow:

```txt
1. Get normalized product.
2. If product not found, return NO_PRODUCT_FOUND.
3. Determine product quantity:
   - explicit quantityKg from user
   - product_quantity from Open Food Facts if available
   - serving_size if parseable
   - fallback defaultWeightKg from mapping
4. Determine best category tag.
5. Find active FoodCarbonFactorMapping.
6. If mapping provider is CLIMATIQ:
   - build Climatiq estimate payload
   - call Climatiq estimate
7. If mapping provider is MANUAL:
   - co2eKg = quantityKg * manualCo2ePerKg
8. If mapping provider is AGRIBALYSE:
   - use Agribalyse dataset integration if already implemented
9. If no mapping exists, return NO_CATEGORY_MAPPING.
10. If createActivityLog is true and estimate succeeds, create ActivityLog.
11. Link ProductScan to ActivityLog if relevant.
```

Important:

* Do not invent product carbon emissions.
* Do not use Eco-Score as exact `co2eKg`.
* Eco-Score can be displayed as environmental metadata, not as a final footprint.
* Always store source and confidence.

---

# 16. Food category mapping strategy

Create:

`src/lib/open-food-facts/category-mapping.ts`

Add a basic mapping helper:

```ts
export function getCandidateCategoryTags(product: {
  categoryTags: string[];
  categories: string[];
}) {
  return [
    ...product.categoryTags,
    ...product.categories.map((category) =>
      category.toLowerCase().replace(/\s+/g, "-")
    ),
  ];
}
```

Mapping priority:

```txt
1. Exact Open Food Facts category tag match
2. Broader parent category match
3. App category match
4. Manual fallback mapping
5. No estimate
```

Example category mappings to support later:

```txt
en:plant-based-foods-and-beverages
en:meats
en:dairies
en:cheeses
en:cereals-and-potatoes
en:beverages
en:snacks
en:fruits
en:vegetables
en:rice
en:pasta
en:chocolate
en:coffee
```

Do not assume all products have clean categories.

---

# 17. Product API routes

Create these backend routes.

## GET `/api/products/barcode/[barcode]`

Purpose:

Fetch and normalize product metadata.

Response:

```json
{
  "product": {
    "barcode": "3017624010701",
    "found": true,
    "productName": "Nutella",
    "brand": "Ferrero",
    "categories": [],
    "categoryTags": [],
    "ecoScore": "d",
    "nutriScore": "e",
    "novaGroup": 4,
    "imageUrl": "..."
  },
  "fromCache": false
}
```

## POST `/api/products/scan`

Purpose:

Record a user scan.

Request:

```json
{
  "barcode": "3017624010701",
  "scanSource": "BARCODE",
  "scanContext": "SHOPPING"
}
```

Response:

```json
{
  "scan": {},
  "product": {}
}
```

## POST `/api/products/estimate-carbon`

Purpose:

Estimate carbon for a scanned product.

Request:

```json
{
  "barcode": "3017624010701",
  "quantityKg": 0.4,
  "scanContext": "MEAL_LOG",
  "createActivityLog": true
}
```

Response when estimated:

```json
{
  "status": "ESTIMATED",
  "estimate": {
    "co2eKg": 1.24,
    "provider": "CLIMATIQ",
    "confidence": "MEDIUM",
    "factorLabel": "Chocolate spread category estimate"
  },
  "activity": {}
}
```

Response when no mapping exists:

```json
{
  "status": "NO_CATEGORY_MAPPING",
  "message": "Product found, but no carbon factor mapping exists for this category yet."
}
```

## POST `/api/products/search`

Purpose:

Search products intentionally.

Request:

```json
{
  "query": "oat milk",
  "page": 1,
  "pageSize": 10
}
```

Do not use this route for search-as-you-type.

## GET `/api/products/recent`

Purpose:

Fetch recent user scans.

---

# 18. Developer routes

Create these routes.

## GET `/api/dev/open-food-facts/config`

Return:

```json
{
  "enabled": true,
  "baseUrlConfigured": true,
  "userAgentConfigured": true,
  "endpoints": [
    {
      "endpoint": "productByBarcode",
      "configured": true
    },
    {
      "endpoint": "search",
      "configured": true
    }
  ]
}
```

Do not return full user agent if it contains private contact info. Return only configured/missing.

## POST `/api/dev/open-food-facts/product`

Request:

```json
{
  "barcode": "3017624010701",
  "useCache": true
}
```

Return:

```json
{
  "ok": true,
  "normalized": {},
  "rawResponse": {},
  "fromCache": false
}
```

## POST `/api/dev/open-food-facts/search`

Request:

```json
{
  "query": "oat milk",
  "page": 1,
  "pageSize": 10
}
```

Return raw and normalized search summaries.

## GET/POST/PATCH/DELETE `/api/dev/open-food-facts/category-mappings`

Purpose:

Manage mappings from Open Food Facts category tags to carbon estimation providers.

Example create mapping:

```json
{
  "provider": "CLIMATIQ",
  "appCategory": "FOOD",
  "openFoodFactsTag": "en:chocolate-spreads",
  "label": "Chocolate spread",
  "climatiqActivityId": "REAL_CLIMATIQ_ACTIVITY_ID",
  "climatiqDataVersion": "^33",
  "climatiqRegion": "IN",
  "unitType": "Weight",
  "defaultWeightKg": 0.4,
  "confidence": "MEDIUM",
  "isActive": true
}
```

Do not allow placeholder Climatiq IDs to be saved as active mappings.

---

# 19. Developer playground

Create developer-only page:

```txt
/dev/open-food-facts-playground
```

Purpose:

Allow testing Open Food Facts calls safely from the app.

The playground should include:

1. Config status card
2. Barcode product lookup tester
3. Product search tester
4. Normalized product viewer
5. Raw JSON response viewer
6. Category tags viewer
7. Carbon mapping tester
8. Mapping management table
9. Cache status
10. Error display
11. Copy response button
12. Clear response button

Block this page if:

```txt
ENABLE_DEV_API_PLAYGROUND !== true
```

Do not expose secrets.

---

# 20. Playground tabs

Include these tabs:

```txt
Config
Barcode Lookup
Search Products
Category Mapping
Carbon Estimate Test
Recent Scans
```

## Barcode Lookup tab

Sample:

```json
{
  "barcode": "3017624010701",
  "useCache": true
}
```

Show:

```txt
Found / not found
Product name
Brand
Quantity
Categories
Category tags
Nutri-Score
NOVA
Eco-Score
Packaging tags
Image
Raw response
```

## Search Products tab

Sample:

```json
{
  "query": "oat milk",
  "page": 1,
  "pageSize": 10
}
```

Warning:

```txt
Do not use Open Food Facts search as search-as-you-type. Use deliberate search only.
```

## Category Mapping tab

Show table:

```txt
Open Food Facts tag
App category
Provider
Factor label
Climatiq activity ID
Manual kg CO₂e/kg
Default weight
Confidence
Active
Actions
```

Actions:

```txt
Create mapping
Edit mapping
Deactivate mapping
Test mapping
```

## Carbon Estimate Test tab

Input:

```json
{
  "barcode": "3017624010701",
  "quantityKg": 0.4,
  "createActivityLog": false
}
```

Show:

```txt
Estimate status
co2eKg if available
Provider
Factor label
Confidence
Reason if estimate unavailable
```

---

# 21. User-facing UI

Create or update these components.

## BarcodeScanner

Purpose:

Allow scanning product barcodes.

Requirements:

* Use browser camera only after user clicks scan.
* Ask for camera permission clearly.
* Support fallback manual barcode input.
* If browser `BarcodeDetector` is available, use it.
* If not available, show manual input fallback or use an existing barcode scanner library if the project already has one.
* Do not block the whole feature if camera scanning is unavailable.

User flow:

```txt
Tap Scan Product
→ camera opens
→ barcode detected
→ call /api/products/scan
→ show ProductLookupCard
→ optionally estimate carbon
```

## BarcodeManualInput

Fields:

```txt
Barcode number
Lookup product
```

## ProductLookupCard

Show:

```txt
Product image
Product name
Brand
Quantity
Category
Eco-Score if available
Nutri-Score if available
NOVA group if available
Packaging tags
Carbon estimate status
```

Do not show raw JSON in normal UI.

## ProductCarbonEstimateCard

Show:

```txt
Estimated footprint
Provider
Confidence
Quantity used
Factor source
Missing mapping notice if unavailable
```

Example unavailable message:

```txt
We found this product, but we do not yet have a verified carbon factor for its category.
```

## ProductScanHistory

Show recent scans:

```txt
Product name
Brand
Scan date
Carbon estimated / not estimated
co2eKg if available
```

---

# 22. Point-of-purchase flow

This feature should support your future browser extension.

Flow:

```txt
User scans product or extension detects product
→ Open Food Facts lookup by barcode if barcode exists
→ category tags are extracted
→ category is mapped to product impact factor
→ app shows simple decision message
```

Example message:

```txt
This product is in a high-impact category. Choosing a plant-based or lower-packaging alternative may reduce your footprint.
```

Do not claim exact carbon savings unless a valid estimate exists.

---

# 23. Receipt import compatibility

Design product lookup to work with receipt parsing later.

Receipt flow later:

```txt
Receipt OCR / AI parser extracts item names
→ product search or category mapping
→ Climatiq batch estimate
→ save receipt footprint
```

For now, only implement barcode and deliberate search.

Do not build full receipt parsing in this task.

---

# 24. Category-to-carbon estimate rules

Use this order for estimating carbon:

```txt
1. Exact product carbon footprint if product has reliable source data
2. Exact Open Food Facts category tag mapped to Climatiq factor
3. Broader category tag mapped to Climatiq / Agribalyse factor
4. Manual category factor from app database
5. No estimate
```

Important:

* Eco-Score is not the same as kg CO₂e.
* Nutri-Score is not carbon data.
* NOVA group is not carbon data.
* Packaging tags are useful context but not complete carbon data.
* Do not calculate carbon from product name alone.
* Do not use AI to invent carbon numbers.

---

# 25. ActivityLog integration

When product carbon estimate succeeds and `createActivityLog` is true, create an ActivityLog:

```ts
{
  userId,
  category: "FOOD",
  activityType: product.productName || "food_product",
  weightValue: quantityKg,
  weightUnit: "kg",
  co2eKg,
  provider: estimateProvider,
  sourceEndpoint: "open_food_facts_product_lookup_plus_carbon_mapping",
  sourcePayload: {
    barcode,
    quantityKg,
    categoryTags,
    mappingId
  },
  sourceResponse: {
    product: normalizedProduct,
    estimate
  },
  confidence,
  calculationMethod: "barcode_category_mapping"
}
```

If carbon is unavailable, save ProductScan but do not create ActivityLog.

---

# 26. Dashboard integration

Update dashboard to include product/food activities.

Add or update:

```txt
Food emissions this week
Recent scanned products
Products without carbon mapping
Top food categories
Carbon estimated vs not estimated
```

Normal dashboard should show:

```txt
Nutella
0.4 kg product
1.24 kg CO₂e
Food
Today
```

If no estimate:

```txt
Nutella
Product found
Carbon estimate unavailable
```

Do not show raw Open Food Facts payloads in normal dashboard.

---

# 27. Error handling

Backend should handle:

```txt
missing user agent
invalid barcode
product not found
Open Food Facts request failure
rate limit response
cache read/write failure
database save failure
category mapping missing
Climatiq estimate failure
manual factor missing
invalid quantity
unauthenticated user
playground disabled
```

Normal frontend error:

```txt
Could not look up this product right now. Please try again or enter the barcode manually.
```

Carbon unavailable message:

```txt
Product found, but no reliable carbon factor is mapped yet.
```

Developer playground error:

```txt
Open Food Facts request failed with status 429
```

Do not crash the app if a product is missing.

---

# 28. Rate limit and caching strategy

Open Food Facts has public rate limits, so caching is required.

Cache:

```txt
Product barcode lookup: 7 days
Search results: 1 day
```

Avoid:

```txt
search-as-you-type
repeated lookup on every render
frontend direct polling
unbounded batch product lookup
```

If many barcodes are imported from a receipt or pantry flow later, process them in a queue or throttled batch.

---

# 29. Security requirements

Strict requirements:

1. Do not call Open Food Facts directly from production client components.
2. Use backend API routes.
3. Always send a custom User-Agent.
4. Do not expose internal mapping logic unnecessarily.
5. Use Clerk authentication for scan history.
6. Do not allow users to create scans for another user.
7. Do not display raw API response in normal UI.
8. Do not store unnecessary camera data.
9. Camera must only activate after user action.
10. Block `/dev/open-food-facts-playground` when playground is disabled.
11. Do not use Open Food Facts search as search-as-you-type.
12. Validate all barcodes and user inputs.

---

# 30. Privacy requirements

Product scans can reveal diet and shopping habits.

Implement:

```txt
Clear user action before scanning
Manual input fallback
Recent scan deletion
No camera activation without user click
No product scan saved unless user is authenticated
No raw camera frames stored
No automatic product tracking without consent
```

User-facing copy:

```txt
We use your barcode scan only to identify the product and estimate its environmental impact. You can delete scan history anytime.
```

---

# 31. Testing requirements

After implementation, test these.

## Test 1: Config status

Open:

```txt
/dev/open-food-facts-playground
```

Expected:

```txt
Page loads only when enabled.
Base URL configured/missing is shown.
User-Agent configured/missing is shown.
No private values are displayed.
```

## Test 2: Barcode lookup

Payload:

```json
{
  "barcode": "3017624010701",
  "useCache": true
}
```

Expected:

```txt
Product lookup succeeds if product exists.
Normalized product appears.
Raw response appears in playground only.
Product is cached.
FoodProduct is upserted.
```

## Test 3: Invalid barcode

Payload:

```json
{
  "barcode": "abc123"
}
```

Expected:

```txt
Validation error.
No Open Food Facts call.
No database write.
```

## Test 4: Product not found

Use a fake numeric barcode.

Expected:

```txt
Returns found: false.
Does not crash.
Can save scan as not found if needed.
```

## Test 5: Search

Payload:

```json
{
  "query": "oat milk",
  "page": 1,
  "pageSize": 10
}
```

Expected:

```txt
Search returns results.
Results are cached.
No search-as-you-type behavior.
```

## Test 6: Record product scan

Request:

```json
{
  "barcode": "3017624010701",
  "scanSource": "BARCODE",
  "scanContext": "SHOPPING"
}
```

Expected:

```txt
Product is fetched or read from cache.
ProductScan is created with Clerk user ID.
Recent scans show the product.
```

## Test 7: Carbon estimate unavailable

Use a product with no mapped category.

Expected:

```txt
Product metadata appears.
Estimate returns NO_CATEGORY_MAPPING.
No ActivityLog is created.
```

## Test 8: Carbon estimate available

Create a test category mapping first.

Then request:

```json
{
  "barcode": "3017624010701",
  "quantityKg": 0.4,
  "createActivityLog": true
}
```

Expected:

```txt
Mapping is found.
Climatiq/manual factor estimate runs.
co2eKg is returned.
ActivityLog is created.
ProductScan can link to ActivityLog.
Dashboard updates.
```

## Test 9: Cache

Submit same barcode twice.

Expected:

```txt
First request calls Open Food Facts.
Second request uses cache.
Playground shows cache status.
```

## Test 10: Camera scanner fallback

Expected:

```txt
If BarcodeDetector exists, camera scanner works.
If not, manual barcode input is shown.
No camera opens without user action.
```

---

# 32. Build and quality checks

Run:

```bash
npm run lint
npm run typecheck
npm run build
npx prisma format
npx prisma generate
```

If the project does not have `typecheck`, use the equivalent TypeScript check.

Fix all TypeScript errors.

Fix all lint errors caused by this implementation.

Do not ignore errors.

---

# 33. Final output required from coding agent

After implementation, provide:

1. Files created
2. Files modified
3. Prisma migration name
4. Environment variables added
5. How to configure Open Food Facts User-Agent
6. How to open the developer playground
7. How to test barcode lookup
8. How to test product search
9. How to test product scan logging
10. How to create category mappings
11. How product lookup connects to Climatiq/Agribalyse/manual carbon factors
12. Known assumptions
13. Any products/categories that cannot be estimated yet
14. Any remaining TODOs

---

# 34. Acceptance criteria

The task is complete only when:

* Open Food Facts calls happen through backend routes.
* Custom User-Agent is configured and sent.
* Barcode lookup works.
* Product search works.
* Product lookup results are normalized.
* Product lookup results are cached.
* Product scans are stored with Clerk user ID.
* Developer playground exists at `/dev/open-food-facts-playground`.
* Playground shows raw response, normalized product, cache status, and errors.
* Category mapping system exists.
* Product-to-carbon estimate works when a mapping exists.
* Product-to-carbon estimate returns a clear unavailable status when mapping is missing.
* Successful product carbon estimates can create ActivityLog entries.
* Dashboard can show food/product activities.
* Camera barcode scanner has manual fallback.
* Camera does not activate without user action.
* Search-as-you-type is not implemented against Open Food Facts.
* App builds successfully.
* TypeScript has no errors.
* Prisma migration runs successfully.
* Existing design, fonts, colors, and layout are preserved.
