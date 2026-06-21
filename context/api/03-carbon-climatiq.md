You are a senior full-stack engineer working on my carbon footprint tracker app called **Carbon Compass AI**.

The app stack is:

* Next.js / React
* TypeScript
* Prisma
* PostgreSQL
* Clerk authentication
* Tailwind CSS
* shadcn-style UI components
* Existing dashboard, activity tracking, gamification, and carbon progress features

Your task is to implement **Climatiq** as a carbon emissions calculation provider and create a **developer API playground** inside the app to test Climatiq API calls safely.

Do not redesign the app.
Do not change the existing color palette.
Do not change existing fonts.
Do not change unrelated components.
Do not break authentication.
Do not break the database.
Do not expose API keys to the frontend.
Do not hardcode secrets.
Do not overcomplicate the implementation.

The goal is to make Climatiq work as a reliable carbon calculation provider inside the app while keeping the architecture provider-agnostic so the app can still support CarbonSutra or Carbon Interface later.

---

# 1. Main objective

Implement this complete flow:

User enters activity data
→ frontend sends request to internal Next.js API route
→ backend validates request
→ backend maps user activity to a Climatiq emission factor
→ backend calls Climatiq using secure server-side credentials
→ backend normalizes Climatiq response into `co2eKg`
→ backend stores result in PostgreSQL using Prisma
→ dashboard reads stored activities
→ developer playground allows testing Climatiq search and estimate calls

Climatiq must never be called directly from client components.

All Climatiq calls must go through server-side code.

---

# 2. Climatiq implementation concept

Climatiq is not only a simple calculator. It is an emission factor API.

The app should support two flows:

## Flow A: Estimate with known emission factor

Use this when the app already knows the Climatiq emission factor or activity ID.

Example:

```txt
User logs: 12 km by car
→ app maps this to a known Climatiq emission factor
→ app sends distance parameters to Climatiq
→ Climatiq returns co2e
```

## Flow B: Search emission factors

Use this when the developer or app needs to find the right emission factor.

Example:

```txt
Developer searches: "passenger car petrol"
→ Climatiq Search returns matching emission factors
→ developer selects one
→ selected factor can be saved as a reusable mapping
```

Both flows are required.

---

# 3. Climatiq features to support

Implement Climatiq as a modular provider that supports:

1. Basic estimate
2. Batch estimate
3. Search emission factors
4. Saved emission factor mappings
5. Transport estimates
6. Electricity estimates
7. Fuel estimates
8. Food/category estimates
9. Shopping/spend-based estimates
10. Product/material/weight-based estimates

For the normal user-facing app, prioritize:

1. Transport estimate
2. Electricity estimate
3. Fuel estimate
4. Shopping/spend estimate
5. Product/material estimate

For the developer playground, support:

1. Search endpoint
2. Estimate endpoint
3. Batch estimate endpoint
4. Raw payload testing
5. Saved factor mapping testing

---

# 4. Architecture rules

Follow this architecture:

```txt
Frontend user form
→ /api/carbon/estimate
→ Provider router
→ Climatiq service
→ Climatiq client
→ Climatiq API
→ Normalize response
→ Cache result
→ Save ActivityLog
→ Return clean response
```

Create a separate developer testing flow:

```txt
Developer playground
→ /api/dev/climatiq/search
→ Climatiq Search API
→ Display emission factors

Developer playground
→ /api/dev/climatiq/estimate
→ Climatiq Estimate API
→ Display raw + normalized response
```

The normal user-facing route should save activity logs.

The developer playground routes should not create normal user activity logs by default.

---

# 5. Environment variables

Add support for these variables:

```env
CLIMATIQ_API_KEY=
CLIMATIQ_BASE_URL=https://api.climatiq.io
CLIMATIQ_DATA_VERSION=^33

ENABLE_DEV_API_PLAYGROUND=true
```

Important:

* Do not expose these values to the client.
* Do not use `NEXT_PUBLIC_` for Climatiq secrets.
* Do not commit `.env.local`.
* Add `.env.example` with placeholder values only.
* `CLIMATIQ_DATA_VERSION` should be configurable because Climatiq data versions change over time.
* If the data version is missing, use the configured fallback from `.env`.
* Do not hardcode a data version inside business logic.

Example `.env.example`:

```env
CLIMATIQ_API_KEY=your_climatiq_api_key_here
CLIMATIQ_BASE_URL=https://api.climatiq.io
CLIMATIQ_DATA_VERSION=^33

ENABLE_DEV_API_PLAYGROUND=false
```

---

# 6. Required folder structure

Create or update this structure:

```txt
src/
  app/
    api/
      carbon/
        estimate/
          route.ts

      dev/
        climatiq/
          config/
            route.ts
          search/
            route.ts
          estimate/
            route.ts
          batch-estimate/
            route.ts
          mappings/
            route.ts

    dev/
      climatiq-playground/
        page.tsx

  lib/
    climatiq/
      client.ts
      constants.ts
      types.ts
      normalize.ts
      cache.ts
      payload-builders.ts
      search-params.ts
      factor-mappings.ts

  server/
    carbon/
      climatiq.service.ts
      provider-router.service.ts
      activity.service.ts

  components/
    carbon/
      CarbonActivityForm.tsx
      CarbonResultCard.tsx
      RecentCarbonActivities.tsx

    dev/
      ClimatiqPlayground.tsx
      ClimatiqSearchPanel.tsx
      ClimatiqEstimateTester.tsx
      ClimatiqBatchEstimateTester.tsx
      ClimatiqFactorMappingPanel.tsx
      JsonResponseViewer.tsx
```

If the project already has a different structure, follow the existing project conventions, but keep the separation between:

* client
* types
* payload builders
* normalization
* cache
* service
* API routes
* playground UI

---

# 7. Prisma schema requirements

Update Prisma schema.

Add or update these enums:

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

enum CalculationProvider {
  CARBONSUTRA
  CARBON_INTERFACE
  CLIMATIQ
  MANUAL
  OPEN_FOOD_FACTS
}

enum CarbonEstimateConfidence {
  LOW
  MEDIUM
  HIGH
}
```

Create or update `ActivityLog`:

```prisma
model ActivityLog {
  id                String              @id @default(cuid())
  userId            String

  category          ActivityCategory
  activityType      String

  quantityValue     Float?
  quantityUnit      String?

  distanceValue     Float?
  distanceUnit      String?

  energyValue       Float?
  energyUnit        String?

  weightValue       Float?
  weightUnit        String?

  moneyValue        Float?
  moneyUnit         String?

  country           String?
  region            String?
  city              String?

  co2eKg            Float
  provider          CalculationProvider @default(CLIMATIQ)

  sourceEndpoint    String?
  sourcePayload     Json?
  sourceResponse    Json?

  sourceFactorId    String?
  sourceActivityId  String?
  sourceDataset     String?
  sourceRegion      String?
  sourceYear        Int?

  confidence        CarbonEstimateConfidence @default(MEDIUM)
  calculationMethod String?

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([userId])
  @@index([category])
  @@index([provider])
  @@index([sourceFactorId])
  @@index([sourceActivityId])
  @@index([createdAt])
}
```

Add estimate cache:

```prisma
model CarbonEstimateCache {
  id             String   @id @default(cuid())
  provider       String
  endpoint       String
  cacheKey       String   @unique
  co2eKg         Float
  sourcePayload  Json
  sourceResponse Json
  createdAt      DateTime @default(now())

  @@index([provider])
  @@index([endpoint])
  @@index([createdAt])
}
```

Add a saved factor mapping model:

```prisma
model EmissionFactorMapping {
  id                 String   @id @default(cuid())

  provider           String   @default("CLIMATIQ")
  appCategory        String
  appActivityType    String

  label              String
  description        String?

  climatiqFactorId   String?
  climatiqActivityId String?
  climatiqDataVersion String
  climatiqRegion     String?
  climatiqYear       Int?
  climatiqSource     String?
  climatiqDataset    String?
  unitType           String?

  defaultParameters  Json?
  metadata           Json?

  isActive           Boolean  @default(true)

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([provider])
  @@index([appCategory])
  @@index([appActivityType])
  @@index([isActive])
}
```

After schema update:

1. Run Prisma format.
2. Run migration.
3. Regenerate Prisma client.
4. Verify the app still builds.

---

# 8. Climatiq API basics

Use this base URL:

```txt
https://api.climatiq.io
```

Use Bearer authentication:

```ts
Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`
```

Important endpoints:

```txt
GET  /data/v1/search
POST /data/v1/estimate
POST /data/v1/estimate/batch
```

The estimate request body should follow this pattern:

```json
{
  "emission_factor": {
    "activity_id": "example_activity_id",
    "data_version": "^33",
    "region": "IN"
  },
  "parameters": {
    "distance": 12,
    "distance_unit": "km"
  }
}
```

The estimate response should be normalized from:

```json
{
  "co2e": 3.42,
  "co2e_unit": "kg"
}
```

Always store `co2eKg`.

If `co2e_unit` is not kg, convert it safely or throw a clear error.

---

# 9. Climatiq types

Create:

`src/lib/climatiq/types.ts`

Add these types:

```ts
export type ClimatiqEndpointKey =
  | "search"
  | "estimate"
  | "batchEstimate";

export type ClimatiqEmissionFactorSelector = {
  id?: string;
  activity_id?: string;
  data_version?: string;
  region?: string;
  year?: number;
  source?: string;
  source_dataset?: string;
  source_lca_activity?: string;
};

export type ClimatiqParameters = {
  distance?: number;
  distance_unit?: "m" | "km" | "mi";

  weight?: number;
  weight_unit?: "g" | "kg" | "t" | "lb";

  energy?: number;
  energy_unit?: "Wh" | "kWh" | "MWh" | "MJ" | "GJ";

  volume?: number;
  volume_unit?: string;

  money?: number;
  money_unit?: string;

  area?: number;
  area_unit?: string;

  time?: number;
  time_unit?: string;

  number?: number;
  number_unit?: string;

  passengers?: number;
  passenger_unit?: string;

  [key: string]: unknown;
};

export type ClimatiqEstimatePayload = {
  emission_factor: ClimatiqEmissionFactorSelector;
  parameters: ClimatiqParameters;
  apply_inflation_adjustment?: number;
};

export type ClimatiqBatchEstimatePayload = {
  emission_factors: ClimatiqEstimatePayload[];
};

export type ClimatiqSearchParams = {
  data_version?: string;
  query?: string;
  activity_id?: string;
  id?: string;
  category?: string;
  sector?: string;
  source?: string;
  source_dataset?: string;
  year?: number;
  region?: string;
  unit_type?: string;
  source_lca_activity?: string;
  calculation_method?: "ar4" | "ar5" | "ar6";
  allowed_data_quality_flags?: string;
  access_type?: "public" | "private" | "premium";
  page?: number;
  results_per_page?: number;
};

export type ClimatiqRawEstimateResponse = {
  co2e?: number | string;
  co2e_unit?: string;
  co2e_calculation_method?: string;
  co2e_calculation_origin?: string;
  emission_factor?: {
    id?: string;
    activity_id?: string;
    name?: string;
    source?: string;
    source_dataset?: string;
    year?: number;
    region?: string;
    category?: string;
    sector?: string;
    unit_type?: string;
    source_lca_activity?: string;
    data_quality_flags?: string[];
  };
  constituent_gases?: Record<string, unknown>;
  activity_data?: Record<string, unknown>;
  audit_trail?: string;
  notices?: unknown[];
};

export type NormalizedClimatiqEstimate = {
  co2eKg: number;
  provider: "CLIMATIQ";
  endpoint: ClimatiqEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
  emissionFactor?: {
    id?: string;
    activityId?: string;
    name?: string;
    source?: string;
    dataset?: string;
    region?: string;
    year?: number;
    category?: string;
    sector?: string;
    unitType?: string;
  };
};
```

---

# 10. Constants

Create:

`src/lib/climatiq/constants.ts`

```ts
export const CLIMATIQ_ENDPOINTS = {
  search: "/data/v1/search",
  estimate: "/data/v1/estimate",
  batchEstimate: "/data/v1/estimate/batch",
};

export const CLIMATIQ_PROVIDER = "CLIMATIQ" as const;

export const DEFAULT_CLIMATIQ_DATA_VERSION =
  process.env.CLIMATIQ_DATA_VERSION || "^33";

export const CLIMATIQ_DISTANCE_UNITS = ["m", "km", "mi"] as const;
export const CLIMATIQ_WEIGHT_UNITS = ["g", "kg", "t", "lb"] as const;
export const CLIMATIQ_ENERGY_UNITS = ["Wh", "kWh", "MWh", "MJ", "GJ"] as const;
export const CLIMATIQ_MONEY_UNITS = ["usd", "eur", "gbp", "inr"] as const;
```

---

# 11. Climatiq client

Create:

`src/lib/climatiq/client.ts`

Requirements:

* Server-side only.
* Uses `fetch`.
* Reads API key and base URL from environment variables.
* Uses Bearer auth.
* Uses `cache: "no-store"`.
* Supports `GET` and `POST`.
* Throws useful errors.
* Never logs the API key.
* Returns raw JSON response.

Implementation:

```ts
import "server-only";

type ClimatiqRequestOptions = {
  path: string;
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  payload?: Record<string, unknown>;
};

function buildUrl(baseUrl: string, path: string, query?: ClimatiqRequestOptions["query"]) {
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

export async function callClimatiq({
  path,
  method = "GET",
  query,
  payload,
}: ClimatiqRequestOptions) {
  const baseUrl = process.env.CLIMATIQ_BASE_URL;
  const apiKey = process.env.CLIMATIQ_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Missing Climatiq environment variables");
  }

  if (!path) {
    throw new Error("Missing Climatiq endpoint path");
  }

  const url = buildUrl(baseUrl, path, query);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: method === "POST" ? JSON.stringify(payload ?? {}) : undefined,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Climatiq request failed", {
      status: response.status,
      path,
      method,
      query,
      payload,
      response: data,
    });

    throw new Error(`Climatiq request failed with status ${response.status}`);
  }

  return data;
}
```

---

# 12. Normalization

Create:

`src/lib/climatiq/normalize.ts`

The app should use `co2eKg` internally.

```ts
export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function normalizeClimatiqCo2eToKg(response: any): number {
  const co2e = parsePossibleNumber(response?.co2e);

  if (co2e === null) {
    throw new Error(
      `Could not extract co2e from Climatiq response: ${JSON.stringify(response)}`
    );
  }

  const unit = String(response?.co2e_unit || "kg").toLowerCase();

  if (unit === "kg" || unit === "kgco2e" || unit === "kg co2e") {
    return co2e;
  }

  if (unit === "t" || unit === "tonne" || unit === "tonnes" || unit === "mt") {
    return co2e * 1000;
  }

  if (unit === "g" || unit === "gco2e") {
    return co2e / 1000;
  }

  throw new Error(`Unsupported Climatiq co2e_unit: ${response?.co2e_unit}`);
}

export function extractClimatiqEmissionFactorMetadata(response: any) {
  const factor = response?.emission_factor;

  if (!factor) return undefined;

  return {
    id: factor.id,
    activityId: factor.activity_id,
    name: factor.name,
    source: factor.source,
    dataset: factor.source_dataset,
    region: factor.region,
    year: factor.year,
    category: factor.category,
    sector: factor.sector,
    unitType: factor.unit_type,
  };
}
```

---

# 13. Cache helper

Create:

`src/lib/climatiq/cache.ts`

```ts
import crypto from "crypto";

export function createClimatiqCacheKey(input: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}
```

Cache key should include:

```ts
{
  provider: "CLIMATIQ",
  endpoint,
  payload
}
```

Service behavior:

1. Build payload.
2. Generate cache key.
3. Check `CarbonEstimateCache`.
4. If found, return cached `co2eKg` and `fromCache: true`.
5. If not found, call Climatiq.
6. Normalize result.
7. Save result to cache.
8. Return result with `fromCache: false`.

---

# 14. Search parameter builder

Create:

`src/lib/climatiq/search-params.ts`

```ts
import { DEFAULT_CLIMATIQ_DATA_VERSION } from "./constants";
import type { ClimatiqSearchParams } from "./types";

export function buildClimatiqSearchParams(input: ClimatiqSearchParams) {
  return {
    data_version: input.data_version ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    query: input.query,
    activity_id: input.activity_id,
    id: input.id,
    category: input.category,
    sector: input.sector,
    source: input.source,
    source_dataset: input.source_dataset,
    year: input.year,
    region: input.region,
    unit_type: input.unit_type,
    source_lca_activity: input.source_lca_activity,
    calculation_method: input.calculation_method,
    allowed_data_quality_flags: input.allowed_data_quality_flags,
    access_type: input.access_type,
    page: input.page ?? 1,
    results_per_page: input.results_per_page ?? 20,
  };
}
```

---

# 15. Payload builders

Create:

`src/lib/climatiq/payload-builders.ts`

Add builder functions that convert app-friendly input into Climatiq payloads.

## Generic estimate payload

```ts
import { DEFAULT_CLIMATIQ_DATA_VERSION } from "./constants";
import type {
  ClimatiqEmissionFactorSelector,
  ClimatiqParameters,
  ClimatiqEstimatePayload,
} from "./types";

export function buildClimatiqEstimatePayload(input: {
  emissionFactor: ClimatiqEmissionFactorSelector;
  parameters: ClimatiqParameters;
  applyInflationAdjustment?: number;
}): ClimatiqEstimatePayload {
  return {
    emission_factor: {
      ...input.emissionFactor,
      data_version:
        input.emissionFactor.data_version ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    },
    parameters: input.parameters,
    ...(input.applyInflationAdjustment
      ? { apply_inflation_adjustment: input.applyInflationAdjustment }
      : {}),
  };
}
```

## Transport distance payload

```ts
export function buildTransportDistancePayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  distanceValue: number;
  distanceUnit: "m" | "km" | "mi";
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      distance: input.distanceValue,
      distance_unit: input.distanceUnit,
    },
  });
}
```

## Electricity payload

```ts
export function buildElectricityPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  energyValue: number;
  energyUnit: "Wh" | "kWh" | "MWh";
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      energy: input.energyValue,
      energy_unit: input.energyUnit,
    },
  });
}
```

## Fuel payload

```ts
export function buildFuelPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  volumeValue?: number;
  volumeUnit?: string;
  energyValue?: number;
  energyUnit?: string;
  weightValue?: number;
  weightUnit?: string;
}) {
  const parameters: Record<string, unknown> = {};

  if (input.volumeValue !== undefined) {
    parameters.volume = input.volumeValue;
    parameters.volume_unit = input.volumeUnit;
  }

  if (input.energyValue !== undefined) {
    parameters.energy = input.energyValue;
    parameters.energy_unit = input.energyUnit;
  }

  if (input.weightValue !== undefined) {
    parameters.weight = input.weightValue;
    parameters.weight_unit = input.weightUnit;
  }

  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters,
  });
}
```

## Spend-based shopping payload

```ts
export function buildSpendBasedPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  moneyValue: number;
  moneyUnit: string;
  spentYear?: number;
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      money: input.moneyValue,
      money_unit: input.moneyUnit,
    },
    applyInflationAdjustment: input.spentYear,
  });
}
```

## Product/material weight payload

```ts
export function buildProductWeightPayload(input: {
  activityId: string;
  dataVersion?: string;
  region?: string;
  weightValue: number;
  weightUnit: "g" | "kg" | "t" | "lb";
}) {
  return buildClimatiqEstimatePayload({
    emissionFactor: {
      activity_id: input.activityId,
      data_version: input.dataVersion,
      region: input.region,
    },
    parameters: {
      weight: input.weightValue,
      weight_unit: input.weightUnit,
    },
  });
}
```

---

# 16. Factor mappings

Create:

`src/lib/climatiq/factor-mappings.ts`

Purpose:

The user-facing app should not ask users for raw Climatiq activity IDs.

Instead, create a mapping layer:

```ts
export type AppEmissionMappingKey =
  | "transport.car.average"
  | "transport.bus.local"
  | "transport.train.local"
  | "electricity.grid.india"
  | "fuel.petrol"
  | "fuel.diesel"
  | "shopping.clothing.spend"
  | "product.steel.weight"
  | "food.generic.meal";

export const DEFAULT_CLIMATIQ_MAPPINGS: Record<
  AppEmissionMappingKey,
  {
    label: string;
    appCategory: string;
    appActivityType: string;
    activityId: string;
    region?: string;
    dataVersion?: string;
    unitType: "Distance" | "Energy" | "Money" | "Weight" | "Volume";
  }
> = {
  "transport.car.average": {
    label: "Average car travel",
    appCategory: "TRANSPORT",
    appActivityType: "car",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Distance",
  },

  "electricity.grid.india": {
    label: "Grid electricity India",
    appCategory: "ELECTRICITY",
    appActivityType: "grid_electricity",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Energy",
  },

  "fuel.petrol": {
    label: "Petrol fuel use",
    appCategory: "FUEL",
    appActivityType: "petrol",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Volume",
  },

  "shopping.clothing.spend": {
    label: "Clothing spend",
    appCategory: "SHOPPING",
    appActivityType: "clothing",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Money",
  },

  "product.steel.weight": {
    label: "Steel product by weight",
    appCategory: "PRODUCT",
    appActivityType: "steel",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Weight",
  },

  "food.generic.meal": {
    label: "Generic meal",
    appCategory: "FOOD",
    appActivityType: "meal",
    activityId: "REPLACE_WITH_VERIFIED_CLIMATIQ_ACTIVITY_ID",
    region: "IN",
    unitType: "Weight",
  },
};
```

Important:

* Do not pretend these placeholder IDs are real.
* The developer must use the Climatiq playground search to find real activity IDs.
* Once real IDs are found, save them in `EmissionFactorMapping`.
* The app should prefer database mappings over hardcoded defaults.
* If no mapping exists, show a clear error instead of making a bad estimate.

---

# 17. Climatiq service

Create:

`src/server/carbon/climatiq.service.ts`

Implement these functions:

```ts
searchClimatiqEmissionFactors()
estimateWithClimatiq()
batchEstimateWithClimatiq()
estimateTransportWithClimatiq()
estimateElectricityWithClimatiq()
estimateFuelWithClimatiq()
estimateSpendWithClimatiq()
estimateProductWeightWithClimatiq()
getEmissionFactorMapping()
saveEmissionFactorMapping()
```

Each estimate function should return:

```ts
{
  co2eKg: number;
  provider: "CLIMATIQ";
  endpoint: "estimate" | "batchEstimate";
  payload: object;
  response: object;
  fromCache: boolean;
  emissionFactor?: {
    id?: string;
    activityId?: string;
    name?: string;
    source?: string;
    dataset?: string;
    region?: string;
    year?: number;
    category?: string;
    sector?: string;
    unitType?: string;
  };
}
```

Create a generic internal helper:

```ts
async function estimateWithClimatiq({
  payload,
  useCache = true,
}: {
  payload: Record<string, unknown>;
  useCache?: boolean;
})
```

This helper should:

1. Create cache key.
2. Check cache if `useCache` is true.
3. Call `POST /data/v1/estimate` if cache miss.
4. Normalize response.
5. Store cache if `useCache` is true.
6. Return normalized estimate.

Example:

```ts
import { callClimatiq } from "@/lib/climatiq/client";
import { CLIMATIQ_ENDPOINTS } from "@/lib/climatiq/constants";
import {
  normalizeClimatiqCo2eToKg,
  extractClimatiqEmissionFactorMetadata,
} from "@/lib/climatiq/normalize";
import { createClimatiqCacheKey } from "@/lib/climatiq/cache";
import { prisma } from "@/lib/prisma";

export async function estimateWithClimatiq({
  payload,
  useCache = true,
}: {
  payload: Record<string, unknown>;
  useCache?: boolean;
}) {
  const cacheKey = createClimatiqCacheKey({
    provider: "CLIMATIQ",
    endpoint: "estimate",
    payload,
  });

  if (useCache) {
    const cached = await prisma.carbonEstimateCache.findUnique({
      where: { cacheKey },
    });

    if (cached) {
      return {
        co2eKg: cached.co2eKg,
        provider: "CLIMATIQ" as const,
        endpoint: "estimate" as const,
        payload,
        response: cached.sourceResponse,
        fromCache: true,
      };
    }
  }

  const response = await callClimatiq({
    path: CLIMATIQ_ENDPOINTS.estimate,
    method: "POST",
    payload,
  });

  const co2eKg = normalizeClimatiqCo2eToKg(response);

  if (useCache) {
    await prisma.carbonEstimateCache.create({
      data: {
        provider: "CLIMATIQ",
        endpoint: "estimate",
        cacheKey,
        co2eKg,
        sourcePayload: payload,
        sourceResponse: response,
      },
    });
  }

  return {
    co2eKg,
    provider: "CLIMATIQ" as const,
    endpoint: "estimate" as const,
    payload,
    response,
    fromCache: false,
    emissionFactor: extractClimatiqEmissionFactorMetadata(response),
  };
}
```

---

# 18. Search service

Implement:

```ts
export async function searchClimatiqEmissionFactors(input: ClimatiqSearchParams) {
  const query = buildClimatiqSearchParams(input);

  return callClimatiq({
    path: CLIMATIQ_ENDPOINTS.search,
    method: "GET",
    query,
  });
}
```

The search function should support:

```txt
query
data_version
category
sector
source
source_dataset
year
region
unit_type
source_lca_activity
calculation_method
access_type
page
results_per_page
```

Developer playground should use this search function to find real emission factors.

---

# 19. User-facing API route

Create or update:

`src/app/api/carbon/estimate/route.ts`

This route is for normal app usage and should save results to `ActivityLog`.

Requirements:

* Use `POST`.
* Use Clerk authentication.
* Reject unauthenticated users.
* Use `zod` validation.
* Support provider `"CLIMATIQ"`.
* Support:

  * `TRANSPORT`
  * `ELECTRICITY`
  * `FUEL`
  * `SHOPPING`
  * `PRODUCT`
* Store result in `ActivityLog`.
* Return a clean response.
* Do not return API secrets.
* Do not expose full raw Climatiq response to normal users unless debug mode is enabled.

Request examples:

## Transport

```json
{
  "category": "TRANSPORT",
  "provider": "CLIMATIQ",
  "mappingKey": "transport.car.average",
  "distanceValue": 12,
  "distanceUnit": "km"
}
```

## Electricity

```json
{
  "category": "ELECTRICITY",
  "provider": "CLIMATIQ",
  "mappingKey": "electricity.grid.india",
  "energyValue": 180,
  "energyUnit": "kWh"
}
```

## Fuel

```json
{
  "category": "FUEL",
  "provider": "CLIMATIQ",
  "mappingKey": "fuel.petrol",
  "volumeValue": 20,
  "volumeUnit": "l"
}
```

## Shopping spend

```json
{
  "category": "SHOPPING",
  "provider": "CLIMATIQ",
  "mappingKey": "shopping.clothing.spend",
  "moneyValue": 2500,
  "moneyUnit": "inr",
  "spentYear": 2026
}
```

## Product by weight

```json
{
  "category": "PRODUCT",
  "provider": "CLIMATIQ",
  "mappingKey": "product.steel.weight",
  "weightValue": 2,
  "weightUnit": "kg"
}
```

Expected response:

```json
{
  "activity": {
    "id": "...",
    "category": "TRANSPORT",
    "activityType": "car",
    "co2eKg": 3.42,
    "provider": "CLIMATIQ",
    "createdAt": "..."
  },
  "estimate": {
    "co2eKg": 3.42,
    "fromCache": false
  }
}
```

---

# 20. Zod validation

Use a discriminated union by `category`.

Example:

```ts
const EstimateSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("TRANSPORT"),
    provider: z.literal("CLIMATIQ"),
    mappingKey: z.string().min(1),
    distanceValue: z.number().positive(),
    distanceUnit: z.enum(["m", "km", "mi"]),
  }),

  z.object({
    category: z.literal("ELECTRICITY"),
    provider: z.literal("CLIMATIQ"),
    mappingKey: z.string().min(1),
    energyValue: z.number().positive(),
    energyUnit: z.enum(["Wh", "kWh", "MWh"]),
  }),

  z.object({
    category: z.literal("FUEL"),
    provider: z.literal("CLIMATIQ"),
    mappingKey: z.string().min(1),
    volumeValue: z.number().positive().optional(),
    volumeUnit: z.string().optional(),
    energyValue: z.number().positive().optional(),
    energyUnit: z.string().optional(),
    weightValue: z.number().positive().optional(),
    weightUnit: z.string().optional(),
  }),

  z.object({
    category: z.literal("SHOPPING"),
    provider: z.literal("CLIMATIQ"),
    mappingKey: z.string().min(1),
    moneyValue: z.number().positive(),
    moneyUnit: z.string().min(1),
    spentYear: z.number().int().optional(),
  }),

  z.object({
    category: z.literal("PRODUCT"),
    provider: z.literal("CLIMATIQ"),
    mappingKey: z.string().min(1),
    weightValue: z.number().positive(),
    weightUnit: z.enum(["g", "kg", "t", "lb"]),
  }),
]);
```

Additional validation:

* distance must be positive
* energy must be positive
* weight must be positive
* money must be positive
* mapping key must resolve to a saved factor
* if mapping is missing, return a clear error
* do not estimate using placeholder activity IDs

---

# 21. Developer config route

Create:

`src/app/api/dev/climatiq/config/route.ts`

This route should return configuration status only, not secrets.

Response:

```json
{
  "enabled": true,
  "baseUrlConfigured": true,
  "apiKeyConfigured": true,
  "dataVersionConfigured": true,
  "endpoints": [
    {
      "endpoint": "search",
      "configured": true
    },
    {
      "endpoint": "estimate",
      "configured": true
    },
    {
      "endpoint": "batchEstimate",
      "configured": true
    }
  ]
}
```

Do not return:

* API key
* full authorization header
* secret values

---

# 22. Developer search route

Create:

`src/app/api/dev/climatiq/search/route.ts`

Requirements:

* Use `GET` or `POST`.
* Only enabled when `ENABLE_DEV_API_PLAYGROUND=true`.
* Require Clerk authentication.
* Ideally restrict to app owner/admin.
* Call Climatiq Search API.
* Return raw search results.
* Do not save ActivityLog.

Support filters:

```txt
query
data_version
category
sector
source
source_dataset
year
region
unit_type
source_lca_activity
calculation_method
access_type
page
results_per_page
```

Example request:

```json
{
  "query": "passenger car petrol",
  "region": "IN",
  "unit_type": "Distance",
  "results_per_page": 10
}
```

---

# 23. Developer estimate route

Create:

`src/app/api/dev/climatiq/estimate/route.ts`

Requirements:

* Use `POST`.
* Only enabled when `ENABLE_DEV_API_PLAYGROUND=true`.
* Require Clerk authentication.
* Ideally restrict to app owner/admin.
* Accept raw Climatiq estimate payload.
* Call Climatiq estimate endpoint.
* Normalize `co2eKg`.
* Return raw response, normalized response, payload, cache status, and errors.
* Do not save ActivityLog by default.

Request:

```json
{
  "payload": {
    "emission_factor": {
      "activity_id": "metals-type_steel_section",
      "data_version": "^33"
    },
    "parameters": {
      "weight": 100,
      "weight_unit": "kg"
    }
  },
  "useCache": true
}
```

Response:

```json
{
  "ok": true,
  "normalized": {
    "co2eKg": 123.45
  },
  "fromCache": false,
  "payload": {},
  "rawResponse": {}
}
```

---

# 24. Developer batch estimate route

Create:

`src/app/api/dev/climatiq/batch-estimate/route.ts`

Requirements:

* Use `POST`.
* Only enabled when `ENABLE_DEV_API_PLAYGROUND=true`.
* Require Clerk authentication.
* Accept array of estimate payloads.
* Call Climatiq batch estimate endpoint.
* Normalize each response item into `co2eKg`.
* Return raw response and normalized array.
* Do not save ActivityLog by default.

---

# 25. Developer mapping routes

Create:

`src/app/api/dev/climatiq/mappings/route.ts`

Support:

```txt
GET    list saved mappings
POST   create a mapping
PATCH  update a mapping
DELETE deactivate a mapping
```

A mapping should connect an app activity to a Climatiq emission factor.

Example mapping:

```json
{
  "appCategory": "TRANSPORT",
  "appActivityType": "car",
  "label": "Average car travel in India",
  "climatiqActivityId": "real_activity_id_from_search",
  "climatiqFactorId": "optional_factor_id",
  "climatiqDataVersion": "^33",
  "climatiqRegion": "IN",
  "unitType": "Distance",
  "defaultParameters": {
    "distance_unit": "km"
  },
  "isActive": true
}
```

Important:

* Do not allow placeholder activity IDs to be saved as active mappings.
* Validate required fields.
* Show errors clearly.

---

# 26. Developer playground page

Create a developer-only playground page:

```txt
/dev/climatiq-playground
```

Purpose:

Allow me to test Climatiq API calls from the UI.

The page should be simple, clean, and clearly marked as a developer tool.

Do not mix this with the normal user dashboard.

The playground should have:

1. API configuration status card
2. Search emission factors tab
3. Estimate tab
4. Batch estimate tab
5. Saved mappings tab
6. Raw JSON editor
7. Submit button
8. Response viewer
9. Normalized `co2eKg` display
10. Cache status display
11. Error display
12. Copy response button
13. Clear response button
14. Save selected factor as mapping button

Use existing design system.

Do not make it childish.
Do not add unnecessary animations.
Do not overdesign it.

---

# 27. Playground tabs

The playground should include these tabs:

```txt
Search Factors
Estimate
Batch Estimate
Saved Mappings
Config
```

## Search Factors tab

Fields:

```txt
Query
Region
Unit Type
Category
Sector
Source
Year
Results per page
Page
```

Default search examples:

```txt
passenger car petrol
grid electricity India
diesel fuel
steel section
clothing spend
rice production
```

Show results with:

```txt
name
activity_id
id
region
year
source
source_dataset
unit_type
category
sector
data_quality_flags
```

Add buttons:

```txt
Copy activity_id
Copy factor id
Use in Estimate
Save as Mapping
```

## Estimate tab

Provide a raw JSON editor with sample payload:

```json
{
  "emission_factor": {
    "activity_id": "metals-type_steel_section",
    "data_version": "^33"
  },
  "parameters": {
    "weight": 100,
    "weight_unit": "kg"
  }
}
```

Show:

```txt
Status
Normalized result
co2e unit
From cache
Raw response
```

## Batch Estimate tab

Provide sample:

```json
[
  {
    "emission_factor": {
      "activity_id": "metals-type_steel_section",
      "data_version": "^33"
    },
    "parameters": {
      "weight": 100,
      "weight_unit": "kg"
    }
  },
  {
    "emission_factor": {
      "activity_id": "metals-type_steel_section",
      "data_version": "^33"
    },
    "parameters": {
      "weight": 50,
      "weight_unit": "kg"
    }
  }
]
```

## Saved Mappings tab

Show table:

```txt
Label
App Category
App Activity Type
Activity ID
Factor ID
Region
Unit Type
Data Version
Active
Actions
```

Actions:

```txt
Test Mapping
Edit
Deactivate
```

---

# 28. User-facing Climatiq activity form

Add or update a normal user activity form separate from the playground.

It should support:

1. Transport
2. Electricity
3. Fuel
4. Shopping spend
5. Product/material weight

User-facing labels should be friendly.

Do not show raw Climatiq variable names to normal users.

## Transport form

Fields:

```txt
Transport type
Distance
Distance unit
```

Internally map transport type to saved mapping key.

## Electricity form

Fields:

```txt
Country / region
Electricity usage
Unit
```

Internally map to saved electricity factor.

## Fuel form

Fields:

```txt
Fuel type
Amount
Unit
```

Internally map fuel type to saved factor.

## Shopping form

Fields:

```txt
Purchase category
Amount spent
Currency
Purchase year
```

Internally map purchase category to spend-based factor.

## Product/material form

Fields:

```txt
Product/material category
Weight
Unit
```

Internally map material to weight-based factor.

---

# 29. Dashboard updates

Update the dashboard to read from `ActivityLog`.

Add or update these metrics:

```txt
Today’s CO₂e
This week’s CO₂e
This month’s CO₂e
Top category
Recent activities
Provider breakdown
```

Use `co2eKg` as the source of truth.

Display units as:

```txt
kg CO₂e
```

For large values, optionally convert to:

```txt
t CO₂e
```

User-facing recent activity example:

```txt
12 km by car
3.42 kg CO₂e
Transport
Climatiq
Today
```

Do not show these technical fields on the normal dashboard:

* sourcePayload
* sourceResponse
* Authorization header
* API key
* raw response
* full Climatiq request body

---

# 30. Provider router

Create or update:

`src/server/carbon/provider-router.service.ts`

Goal:

The app should support multiple providers later.

Implement provider routing:

```ts
export async function estimateCarbon(input: CarbonEstimateInput) {
  if (input.provider === "CLIMATIQ") {
    return estimateWithClimatiqFromAppInput(input);
  }

  if (input.provider === "CARBONSUTRA") {
    return estimateWithCarbonSutraFromAppInput(input);
  }

  if (input.provider === "CARBON_INTERFACE") {
    return estimateWithCarbonInterfaceFromAppInput(input);
  }

  throw new Error(`Unsupported carbon provider: ${input.provider}`);
}
```

Do not remove existing CarbonSutra or Carbon Interface code if present.

---

# 31. Error handling requirements

Backend should handle:

* missing API key
* missing base URL
* missing data version
* invalid payload
* Climatiq API failure
* normalization failure
* database save failure
* cache read/write failure
* rate limits
* unauthenticated user
* playground disabled
* missing emission factor mapping
* placeholder activity ID
* unsupported unit type

Frontend should show friendly errors:

```txt
Could not calculate this activity right now. Please check the values and try again.
```

Developer playground should show technical errors:

```txt
Climatiq request failed with status 401
```

Do not log API keys.

Server logs may include:

```ts
{
  provider: "CLIMATIQ",
  endpoint,
  payload,
  status,
  error
}
```

---

# 32. Security requirements

Strict requirements:

1. Never expose Climatiq API key to client components.
2. Never use `NEXT_PUBLIC_` for Climatiq secrets.
3. Never commit `.env.local`.
4. Use server-side API routes only.
5. Use Clerk authentication for user-facing activity logging.
6. Use Clerk authentication for developer playground.
7. Do not allow users to create logs for another user.
8. Block or hide `/dev/climatiq-playground` when `ENABLE_DEV_API_PLAYGROUND` is not true.
9. Do not display secrets in the playground.
10. Do not log API keys.
11. Do not return authorization headers to the frontend.
12. Do not save placeholder emission factor IDs as active mappings.

---

# 33. Testing requirements

After implementation, test the following:

## Test 1: Config status

Go to:

```txt
/dev/climatiq-playground
```

Expected:

* page loads only when enabled
* API key status is shown as configured/missing
* base URL status is shown
* data version status is shown
* no secrets are displayed

## Test 2: Search factors

Search:

```json
{
  "query": "steel section",
  "unit_type": "Weight",
  "results_per_page": 5
}
```

Expected:

* Climatiq Search returns results
* results show activity ID, factor ID, name, unit type, region, source, and year
* no API key is exposed

## Test 3: Estimate

Use a known activity ID from Search.

Payload:

```json
{
  "emission_factor": {
    "activity_id": "PASTE_REAL_ACTIVITY_ID_FROM_SEARCH",
    "data_version": "^33"
  },
  "parameters": {
    "weight": 100,
    "weight_unit": "kg"
  }
}
```

Expected:

* Climatiq Estimate succeeds
* raw response is visible
* normalized `co2eKg` appears
* cache status appears

## Test 4: Batch estimate

Use two valid payloads.

Expected:

* batch request succeeds
* each result is normalized
* raw response is visible

## Test 5: Save mapping

From search result:

* select an emission factor
* save it as mapping
* mapping appears in Saved Mappings tab
* placeholder IDs are rejected

## Test 6: Test mapping

Use saved mapping to run estimate.

Expected:

* estimate succeeds
* mapping is used
* normalized result appears

## Test 7: User activity logging

Use normal app form.

Expected:

* user submits transport/electricity/fuel/shopping/product activity
* backend resolves mapping
* backend calls Climatiq
* `ActivityLog` is created with real Clerk user ID
* dashboard updates

## Test 8: Cache

Submit the same Climatiq payload twice.

Expected:

* first request calls Climatiq
* second request uses cache
* playground shows `fromCache: true`
* normal user route can still create separate ActivityLog entries while reusing cached estimate

## Test 9: Missing mapping

Submit a user-facing activity with no mapping.

Expected:

* app does not guess
* app returns clear error
* no ActivityLog is created

---

# 34. Build and quality checks

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

# 35. Final output required from coding agent

After implementation, provide a summary with:

1. Files created
2. Files modified
3. Prisma migration name
4. Environment variables added
5. How to configure Climatiq API key
6. How to configure Climatiq data version
7. How to open the developer playground
8. How to search emission factors
9. How to save factor mappings
10. How to test the estimate endpoint
11. How to test the batch estimate endpoint
12. Known assumptions about Climatiq payload fields
13. Any mappings still using placeholders
14. Any endpoints that could not be verified
15. Any remaining TODOs

---

# 36. Acceptance criteria

The task is complete only when:

* Climatiq API is called only from backend server-side code.
* API keys are not exposed.
* Search emission factors works.
* Basic estimate works.
* Batch estimate works.
* Developer playground exists at `/dev/climatiq-playground`.
* Playground can search factors, estimate emissions, batch estimate, and save mappings.
* Playground shows raw response, normalized result, errors, and cache status.
* Results are normalized into `co2eKg`.
* User-facing estimates are saved to `ActivityLog`.
* Dashboard reads from `ActivityLog`.
* Cache prevents duplicate Climatiq calls for the same payload.
* Saved factor mappings are used for user-facing forms.
* Placeholder emission factor IDs are not used in production estimates.
* Clerk user ID is used for user activity logs.
* The app builds successfully.
* TypeScript has no errors.
* Prisma migration runs successfully.
* Existing design, fonts, colors, and layout are preserved.
