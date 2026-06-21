You are a senior full-stack engineer working on my carbon footprint tracker app called **Carbon Compass AI**.

The app stack is:

* Next.js / React
* TypeScript
* Prisma
* PostgreSQL
* Clerk authentication
* Tailwind CSS
* shadcn-style UI components
* Existing dashboard, activity tracking, and gamified carbon progress features

Your task is to implement **Carbon Interface** as a carbon emissions calculation provider and create a **developer API test playground** inside the app to test Carbon Interface API calls safely.

Do not redesign the app.
Do not change the existing color palette.
Do not change existing fonts.
Do not change unrelated components.
Do not break authentication.
Do not break the database.
Do not expose API keys to the frontend.
Do not hardcode secrets.
Do not overcomplicate the implementation.

The goal is to make Carbon Interface work reliably as a clean emissions provider inside the app.

---

# 1. Main objective

Implement this complete flow:

User enters activity data
→ frontend sends request to internal Next.js API route
→ backend validates request
→ backend calls Carbon Interface using secure server-side credentials
→ backend normalizes Carbon Interface response into `co2eKg`
→ backend stores result in PostgreSQL using Prisma
→ dashboard reads stored activities
→ developer playground allows testing Carbon Interface calls

Carbon Interface must never be called directly from client components.

All Carbon Interface calls must go through server-side code.

---

# 2. Carbon Interface features to support

Implement Carbon Interface as a modular provider that supports these categories:

1. Vehicle emissions
2. Electricity emissions
3. Flight emissions
4. Shipping emissions
5. Fuel combustion emissions
6. Vehicle makes lookup
7. Vehicle models lookup

For the user-facing app, prioritize:

1. Vehicle
2. Electricity
3. Flights

For the developer playground, create test forms for all supported Carbon Interface estimate types.

---

# 3. Important architecture rules

Follow this architecture:

```txt
Frontend form
→ /api/carbon/estimate
→ Carbon service
→ Carbon Interface client
→ Carbon Interface API
→ Normalize response
→ Cache result
→ Save ActivityLog
→ Return clean response to frontend
```

Create a separate developer testing flow:

```txt
Developer playground
→ /api/dev/carbon-interface/test
→ Carbon Interface client
→ Raw Carbon Interface response
→ Playground response viewer
```

The normal user-facing route should save data to the database.

The developer playground route should test Carbon Interface calls without creating user activity logs by default.

---

# 4. Environment variables

Add support for these variables:

```env
CARBON_INTERFACE_API_KEY=
CARBON_INTERFACE_BASE_URL=https://www.carboninterface.com/api/v1

ENABLE_DEV_API_PLAYGROUND=true
```

Important:

* Do not expose these values to the client.
* Do not use `NEXT_PUBLIC_` for Carbon Interface secrets.
* Do not commit `.env.local`.
* Add `.env.example` with placeholder values only.

Example `.env.example`:

```env
CARBON_INTERFACE_API_KEY=your_carbon_interface_api_key_here
CARBON_INTERFACE_BASE_URL=https://www.carboninterface.com/api/v1

ENABLE_DEV_API_PLAYGROUND=false
```

---

# 5. Required folder structure

Create or update this structure:

```txt
src/
  app/
    api/
      carbon/
        estimate/
          route.ts

      dev/
        carbon-interface/
          test/
            route.ts
          config/
            route.ts
          vehicle-makes/
            route.ts
          vehicle-models/
            route.ts

    dev/
      carbon-interface-playground/
        page.tsx

  lib/
    carbon-interface/
      client.ts
      normalize.ts
      types.ts
      cache.ts
      payload-builders.ts
      constants.ts

  server/
    carbon/
      carbon-interface.service.ts
      activity.service.ts

  components/
    carbon/
      CarbonActivityForm.tsx
      CarbonResultCard.tsx
      RecentCarbonActivities.tsx

    dev/
      CarbonInterfacePlayground.tsx
      CarbonInterfaceEndpointTester.tsx
      JsonResponseViewer.tsx
```

If the project already has a different folder convention, follow the existing convention, but keep the separation between:

* API route
* Carbon Interface client
* payload builders
* normalization logic
* cache logic
* server-side carbon service
* developer playground UI

---

# 6. Prisma schema requirements

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
  RECYCLING
}

enum CalculationProvider {
  CARBONSUTRA
  CARBON_INTERFACE
  MANUAL
  OPEN_FOOD_FACTS
  CLIMATIQ
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
  provider          CalculationProvider @default(CARBON_INTERFACE)

  sourceEndpoint    String?
  sourcePayload     Json?
  sourceResponse    Json?

  confidence        CarbonEstimateConfidence @default(MEDIUM)
  calculationMethod String?

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([userId])
  @@index([category])
  @@index([provider])
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

After schema update:

1. Run Prisma format.
2. Run migration.
3. Regenerate Prisma client.
4. Verify the app still builds.

---

# 7. Carbon Interface API basics

Use this base URL:

```txt
https://www.carboninterface.com/api/v1
```

Use Bearer authentication:

```ts
Authorization: `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`
```

Main estimate endpoint:

```txt
POST /estimates
```

Useful metadata endpoints:

```txt
GET /vehicle_makes
GET /vehicle_makes/:vehicle_make_id/vehicle_models
```

The Carbon Interface response usually follows this structure:

```json
{
  "data": {
    "id": "...",
    "type": "estimate",
    "attributes": {
      "carbon_g": 1234,
      "carbon_lb": 2.72,
      "carbon_kg": 1.23,
      "carbon_mt": 0.00123,
      "estimated_at": "..."
    }
  }
}
```

Use `data.attributes.carbon_kg` as the primary normalized value.

---

# 8. Carbon Interface types

Create:

`src/lib/carbon-interface/types.ts`

Add these types:

```ts
export type CarbonInterfaceEstimateType =
  | "vehicle"
  | "electricity"
  | "flight"
  | "shipping"
  | "fuel_combustion";

export type CarbonInterfaceEndpointKey =
  | "estimate"
  | "vehicleMakes"
  | "vehicleModels";

export type CarbonInterfaceVehiclePayload = {
  type: "vehicle";
  distance_unit: "mi" | "km";
  distance_value: number;
  vehicle_model_id: string;
};

export type CarbonInterfaceElectricityPayload = {
  type: "electricity";
  electricity_unit: "mwh" | "kwh";
  electricity_value: number;
  country: string;
  state?: string;
};

export type CarbonInterfaceFlightPayload = {
  type: "flight";
  passengers: number;
  legs: Array<{
    departure_airport: string;
    destination_airport: string;
  }>;
  distance_unit?: "mi" | "km";
};

export type CarbonInterfaceShippingPayload = {
  type: "shipping";
  weight_unit: "g" | "lb" | "kg" | "mt";
  weight_value: number;
  distance_unit: "mi" | "km";
  distance_value: number;
  transport_method: "ship" | "train" | "truck" | "plane";
};

export type CarbonInterfaceFuelCombustionPayload = {
  type: "fuel_combustion";
  fuel_source_type: string;
  fuel_source_unit: string;
  fuel_source_value: number;
};

export type CarbonInterfaceEstimatePayload =
  | CarbonInterfaceVehiclePayload
  | CarbonInterfaceElectricityPayload
  | CarbonInterfaceFlightPayload
  | CarbonInterfaceShippingPayload
  | CarbonInterfaceFuelCombustionPayload;

export type CarbonInterfaceRawEstimateResponse = {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      carbon_g?: number | string;
      carbon_lb?: number | string;
      carbon_kg?: number | string;
      carbon_mt?: number | string;
      estimated_at?: string;
      [key: string]: unknown;
    };
  };
};

export type NormalizedCarbonInterfaceEstimate = {
  co2eKg: number;
  provider: "CARBON_INTERFACE";
  endpoint: CarbonInterfaceEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};
```

If the real Carbon Interface API requires slightly different field names, update the types after testing with the official docs and playground.

---

# 9. Constants

Create:

`src/lib/carbon-interface/constants.ts`

Add useful constants:

```ts
export const CARBON_INTERFACE_ENDPOINTS = {
  estimates: "/estimates",
  vehicleMakes: "/vehicle_makes",
  vehicleModels: (makeId: string) => `/vehicle_makes/${makeId}/vehicle_models`,
};

export const CARBON_INTERFACE_PROVIDER = "CARBON_INTERFACE" as const;

export const VEHICLE_DISTANCE_UNITS = ["mi", "km"] as const;
export const ELECTRICITY_UNITS = ["kwh", "mwh"] as const;
export const SHIPPING_WEIGHT_UNITS = ["g", "lb", "kg", "mt"] as const;
export const SHIPPING_DISTANCE_UNITS = ["mi", "km"] as const;
export const SHIPPING_TRANSPORT_METHODS = ["ship", "train", "truck", "plane"] as const;
```

---

# 10. Carbon Interface client

Create:

`src/lib/carbon-interface/client.ts`

Requirements:

* Server-side only.
* Uses `fetch`.
* Reads API key and base URL from environment variables.
* Uses Bearer auth.
* Uses `cache: "no-store"`.
* Throws useful errors.
* Never logs API key.
* Returns raw JSON response.

Implementation:

```ts
import "server-only";

type CarbonInterfaceRequestOptions = {
  path: string;
  method?: "GET" | "POST";
  payload?: Record<string, unknown>;
};

export async function callCarbonInterface({
  path,
  method = "GET",
  payload,
}: CarbonInterfaceRequestOptions) {
  const baseUrl = process.env.CARBON_INTERFACE_BASE_URL;
  const apiKey = process.env.CARBON_INTERFACE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Missing Carbon Interface environment variables");
  }

  if (!path) {
    throw new Error("Missing Carbon Interface endpoint path");
  }

  const response = await fetch(`${baseUrl}${path}`, {
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
    console.error("Carbon Interface request failed", {
      status: response.status,
      path,
      method,
      payload,
      response: data,
    });

    throw new Error(
      `Carbon Interface request failed with status ${response.status}`
    );
  }

  return data;
}
```

---

# 11. Response normalization

Create:

`src/lib/carbon-interface/normalize.ts`

The entire app should use `co2eKg` internally.

Use `data.attributes.carbon_kg` as the primary source.

```ts
export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function extractCo2eKgFromCarbonInterface(response: any): number {
  const primaryValue = parsePossibleNumber(
    response?.data?.attributes?.carbon_kg
  );

  if (primaryValue !== null) {
    return primaryValue;
  }

  const fallbackValues = [
    response?.data?.attributes?.carbon_kg,
    response?.data?.attributes?.carbonKg,
    response?.attributes?.carbon_kg,
    response?.carbon_kg,
    response?.carbonKg,
    response?.co2eKg,
  ];

  for (const value of fallbackValues) {
    const parsed = parsePossibleNumber(value);
    if (parsed !== null) return parsed;
  }

  throw new Error(
    `Could not extract carbon_kg from Carbon Interface response: ${JSON.stringify(
      response
    )}`
  );
}
```

---

# 12. Cache helper

Create:

`src/lib/carbon-interface/cache.ts`

```ts
import crypto from "crypto";

export function createCarbonInterfaceCacheKey(input: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}
```

Cache key should include:

```ts
{
  provider: "CARBON_INTERFACE",
  endpoint,
  payload
}
```

Service behavior:

1. Build payload.
2. Generate cache key.
3. Check `CarbonEstimateCache`.
4. If found, return cached `co2eKg` and `fromCache: true`.
5. If not found, call Carbon Interface.
6. Normalize result.
7. Save result to cache.
8. Return result with `fromCache: false`.

This is required because Carbon Interface has limited free-tier requests.

---

# 13. Payload builders

Create:

`src/lib/carbon-interface/payload-builders.ts`

Add builder functions that convert app-friendly input into Carbon Interface payloads.

## Vehicle payload

```ts
export function buildCarbonInterfaceVehiclePayload(input: {
  vehicleModelId: string;
  distanceValue: number;
  distanceUnit: "mi" | "km";
}) {
  return {
    type: "vehicle" as const,
    distance_unit: input.distanceUnit,
    distance_value: input.distanceValue,
    vehicle_model_id: input.vehicleModelId,
  };
}
```

## Electricity payload

```ts
export function buildCarbonInterfaceElectricityPayload(input: {
  country: string;
  state?: string;
  electricityValue: number;
  electricityUnit: "kwh" | "mwh";
}) {
  return {
    type: "electricity" as const,
    electricity_unit: input.electricityUnit,
    electricity_value: input.electricityValue,
    country: input.country.toLowerCase(),
    ...(input.state ? { state: input.state.toLowerCase() } : {}),
  };
}
```

## Flight payload

```ts
export function buildCarbonInterfaceFlightPayload(input: {
  passengers: number;
  legs: Array<{
    departureAirport: string;
    destinationAirport: string;
  }>;
  distanceUnit?: "mi" | "km";
}) {
  return {
    type: "flight" as const,
    passengers: input.passengers,
    legs: input.legs.map((leg) => ({
      departure_airport: leg.departureAirport.toLowerCase(),
      destination_airport: leg.destinationAirport.toLowerCase(),
    })),
    ...(input.distanceUnit ? { distance_unit: input.distanceUnit } : {}),
  };
}
```

## Shipping payload

```ts
export function buildCarbonInterfaceShippingPayload(input: {
  weightValue: number;
  weightUnit: "g" | "lb" | "kg" | "mt";
  distanceValue: number;
  distanceUnit: "mi" | "km";
  transportMethod: "ship" | "train" | "truck" | "plane";
}) {
  return {
    type: "shipping" as const,
    weight_unit: input.weightUnit,
    weight_value: input.weightValue,
    distance_unit: input.distanceUnit,
    distance_value: input.distanceValue,
    transport_method: input.transportMethod,
  };
}
```

## Fuel combustion payload

```ts
export function buildCarbonInterfaceFuelPayload(input: {
  fuelSourceType: string;
  fuelSourceUnit: string;
  fuelSourceValue: number;
}) {
  return {
    type: "fuel_combustion" as const,
    fuel_source_type: input.fuelSourceType,
    fuel_source_unit: input.fuelSourceUnit,
    fuel_source_value: input.fuelSourceValue,
  };
}
```

---

# 14. Carbon Interface service

Create:

`src/server/carbon/carbon-interface.service.ts`

Implement these functions:

```ts
estimateVehicleWithCarbonInterface()
estimateElectricityWithCarbonInterface()
estimateFlightWithCarbonInterface()
estimateShippingWithCarbonInterface()
estimateFuelCombustionWithCarbonInterface()
getCarbonInterfaceVehicleMakes()
getCarbonInterfaceVehicleModels()
estimateWithCarbonInterface()
```

Each estimate function should return:

```ts
{
  co2eKg: number;
  provider: "CARBON_INTERFACE";
  endpoint: "estimate";
  payload: object;
  response: object;
  fromCache: boolean;
}
```

Create a generic internal helper:

```ts
async function estimateWithCarbonInterface({
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
3. Call `POST /estimates` if cache miss.
4. Normalize response.
5. Store cache if `useCache` is true.
6. Return normalized estimate.

Example:

```ts
import { callCarbonInterface } from "@/lib/carbon-interface/client";
import { CARBON_INTERFACE_ENDPOINTS } from "@/lib/carbon-interface/constants";
import { extractCo2eKgFromCarbonInterface } from "@/lib/carbon-interface/normalize";
import { createCarbonInterfaceCacheKey } from "@/lib/carbon-interface/cache";
import { prisma } from "@/lib/prisma";

export async function estimateWithCarbonInterface({
  payload,
  useCache = true,
}: {
  payload: Record<string, unknown>;
  useCache?: boolean;
}) {
  const cacheKey = createCarbonInterfaceCacheKey({
    provider: "CARBON_INTERFACE",
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
        provider: "CARBON_INTERFACE" as const,
        endpoint: "estimate",
        payload,
        response: cached.sourceResponse,
        fromCache: true,
      };
    }
  }

  const response = await callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.estimates,
    method: "POST",
    payload,
  });

  const co2eKg = extractCo2eKgFromCarbonInterface(response);

  if (useCache) {
    await prisma.carbonEstimateCache.create({
      data: {
        provider: "CARBON_INTERFACE",
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
    provider: "CARBON_INTERFACE" as const,
    endpoint: "estimate",
    payload,
    response,
    fromCache: false,
  };
}
```

Add vehicle metadata functions:

```ts
export async function getCarbonInterfaceVehicleMakes() {
  return callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.vehicleMakes,
    method: "GET",
  });
}

export async function getCarbonInterfaceVehicleModels(makeId: string) {
  return callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.vehicleModels(makeId),
    method: "GET",
  });
}
```

---

# 15. User-facing API route

Create or update:

`src/app/api/carbon/estimate/route.ts`

This route is for normal app usage and should save results to `ActivityLog`.

Requirements:

* Use `POST`.
* Use Clerk authentication.
* Reject unauthenticated users.
* Use `zod` validation.
* Support:

  * `TRANSPORT`
  * `ELECTRICITY`
  * `FLIGHT`
* Optionally support:

  * `SHIPPING`
  * `FUEL`
* Store result in `ActivityLog`.
* Return a clean response.
* Do not return API secrets.
* Do not expose raw API response to normal users unless needed for debugging.

Request examples:

## Vehicle

```json
{
  "category": "TRANSPORT",
  "provider": "CARBON_INTERFACE",
  "vehicleModelId": "7268a9b7-17e8-4c8d-acca-57059252afe9",
  "distanceValue": 12,
  "distanceUnit": "km"
}
```

## Electricity

```json
{
  "category": "ELECTRICITY",
  "provider": "CARBON_INTERFACE",
  "country": "us",
  "state": "ny",
  "electricityValue": 180,
  "electricityUnit": "kwh"
}
```

## Flight

```json
{
  "category": "FLIGHT",
  "provider": "CARBON_INTERFACE",
  "passengers": 1,
  "legs": [
    {
      "departureAirport": "bom",
      "destinationAirport": "del"
    }
  ],
  "distanceUnit": "km"
}
```

## Shipping

```json
{
  "category": "SHIPPING",
  "provider": "CARBON_INTERFACE",
  "weightValue": 1.5,
  "weightUnit": "kg",
  "distanceValue": 1200,
  "distanceUnit": "km",
  "transportMethod": "truck"
}
```

## Fuel combustion

```json
{
  "category": "FUEL",
  "provider": "CARBON_INTERFACE",
  "fuelSourceType": "dfo",
  "fuelSourceUnit": "btu",
  "fuelSourceValue": 50000
}
```

Expected response:

```json
{
  "activity": {
    "id": "...",
    "category": "TRANSPORT",
    "activityType": "vehicle",
    "co2eKg": 3.42,
    "provider": "CARBON_INTERFACE",
    "createdAt": "..."
  },
  "estimate": {
    "co2eKg": 3.42,
    "fromCache": false
  }
}
```

---

# 16. Zod validation

Use a discriminated union by `category`.

Example schema:

```ts
const EstimateSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("TRANSPORT"),
    provider: z.literal("CARBON_INTERFACE").optional(),
    vehicleModelId: z.string().min(1),
    distanceValue: z.number().positive(),
    distanceUnit: z.enum(["mi", "km"]),
  }),

  z.object({
    category: z.literal("ELECTRICITY"),
    provider: z.literal("CARBON_INTERFACE").optional(),
    country: z.string().min(2).max(2),
    state: z.string().min(2).max(2).optional(),
    electricityValue: z.number().positive(),
    electricityUnit: z.enum(["kwh", "mwh"]),
  }),

  z.object({
    category: z.literal("FLIGHT"),
    provider: z.literal("CARBON_INTERFACE").optional(),
    passengers: z.number().int().positive(),
    legs: z.array(
      z.object({
        departureAirport: z.string().length(3),
        destinationAirport: z.string().length(3),
      })
    ).min(1),
    distanceUnit: z.enum(["mi", "km"]).optional(),
  }),

  z.object({
    category: z.literal("SHIPPING"),
    provider: z.literal("CARBON_INTERFACE").optional(),
    weightValue: z.number().positive(),
    weightUnit: z.enum(["g", "lb", "kg", "mt"]),
    distanceValue: z.number().positive(),
    distanceUnit: z.enum(["mi", "km"]),
    transportMethod: z.enum(["ship", "train", "truck", "plane"]),
  }),

  z.object({
    category: z.literal("FUEL"),
    provider: z.literal("CARBON_INTERFACE").optional(),
    fuelSourceType: z.string().min(1),
    fuelSourceUnit: z.string().min(1),
    fuelSourceValue: z.number().positive(),
  }),
]);
```

Add extra validation:

* airport codes must be lowercase or normalized to lowercase
* flight origin and destination cannot be same
* passengers must be at least 1
* distance must be positive
* electricity usage must be positive
* shipping weight must be positive
* fuel value must be positive

---

# 17. Developer-only Carbon Interface test route

Create:

`src/app/api/dev/carbon-interface/test/route.ts`

This route is for testing Carbon Interface calls from the playground.

Requirements:

* Use `POST`.
* Only enabled when `ENABLE_DEV_API_PLAYGROUND=true`.
* Should be blocked in production unless explicitly enabled.
* Should require the user to be authenticated.
* Ideally only allow the app owner/admin user.
* Does not save `ActivityLog` by default.
* Calls Carbon Interface and returns:

  * endpoint type
  * request payload
  * normalized `co2eKg` if extractable
  * raw response
  * fromCache status
  * errors if any

Request shape:

```json
{
  "type": "vehicle",
  "payload": {
    "type": "vehicle",
    "distance_unit": "km",
    "distance_value": 12,
    "vehicle_model_id": "7268a9b7-17e8-4c8d-acca-57059252afe9"
  },
  "useCache": true
}
```

Response shape:

```json
{
  "ok": true,
  "type": "vehicle",
  "payload": {},
  "normalized": {
    "co2eKg": 3.42
  },
  "fromCache": false,
  "rawResponse": {}
}
```

On error:

```json
{
  "ok": false,
  "type": "vehicle",
  "error": "Carbon Interface request failed with status 401"
}
```

---

# 18. Developer config route

Create:

`src/app/api/dev/carbon-interface/config/route.ts`

This route should return configuration status only, not secrets.

Response:

```json
{
  "enabled": true,
  "baseUrlConfigured": true,
  "apiKeyConfigured": true,
  "endpoints": [
    {
      "endpoint": "estimates",
      "configured": true
    },
    {
      "endpoint": "vehicleMakes",
      "configured": true
    },
    {
      "endpoint": "vehicleModels",
      "configured": true
    }
  ]
}
```

Do not return:

* API key
* full environment values
* headers
* secrets

---

# 19. Vehicle metadata routes

Create:

`src/app/api/dev/carbon-interface/vehicle-makes/route.ts`

This should call:

```txt
GET /vehicle_makes
```

Create:

`src/app/api/dev/carbon-interface/vehicle-models/route.ts`

This should accept a `makeId` query parameter and call:

```txt
GET /vehicle_makes/:vehicle_make_id/vehicle_models
```

These routes are for the developer playground and optionally for the user-facing vehicle form.

Requirements:

* Use server-side API key.
* Do not expose API key.
* Validate `makeId`.
* Return clean JSON.
* Show errors clearly.

---

# 20. Developer API playground page

Create a developer-only playground page:

```txt
/dev/carbon-interface-playground
```

Purpose:

Allow me to test Carbon Interface API calls from the UI.

The page should be simple, clean, and clearly marked as a developer tool.

Do not mix this with the normal user dashboard.

The playground should have:

1. API configuration status card
2. Estimate type selector
3. Prebuilt test forms for each estimate type
4. Raw JSON editor
5. Submit button
6. Response viewer
7. Normalized `co2eKg` display
8. Cache status display
9. Error display
10. Copy response button
11. Clear response button
12. Vehicle makes tester
13. Vehicle models tester

Use existing design system.

Do not make it childish.
Do not add unnecessary animations.
Do not overdesign it.

---

# 21. Playground tabs

The playground should include tabs or dropdown options for:

```txt
Vehicle
Electricity
Flight
Shipping
Fuel Combustion
Vehicle Makes
Vehicle Models
```

Each tab should have a sample payload.

## Vehicle sample

```json
{
  "type": "vehicle",
  "distance_unit": "km",
  "distance_value": 12,
  "vehicle_model_id": "7268a9b7-17e8-4c8d-acca-57059252afe9"
}
```

## Electricity sample

```json
{
  "type": "electricity",
  "electricity_unit": "kwh",
  "electricity_value": 180,
  "country": "us",
  "state": "ny"
}
```

## Flight sample

```json
{
  "type": "flight",
  "passengers": 1,
  "legs": [
    {
      "departure_airport": "bom",
      "destination_airport": "del"
    }
  ],
  "distance_unit": "km"
}
```

## Shipping sample

```json
{
  "type": "shipping",
  "weight_unit": "kg",
  "weight_value": 1.5,
  "distance_unit": "km",
  "distance_value": 1200,
  "transport_method": "truck"
}
```

## Fuel combustion sample

```json
{
  "type": "fuel_combustion",
  "fuel_source_type": "dfo",
  "fuel_source_unit": "btu",
  "fuel_source_value": 50000
}
```

Important:

If the official Carbon Interface docs require different field names or allowed values, update the sample payloads to match the real API.

---

# 22. Playground UI details

The playground should show:

```txt
Carbon Interface API Playground
Developer tool for testing Carbon Interface emission endpoints.
```

Configuration card:

```txt
API key: Configured / Missing
Base URL: Configured / Missing
Estimate endpoint: Configured
Vehicle makes endpoint: Configured
Vehicle models endpoint: Configured
```

Endpoint test card:

```txt
Estimate type: Vehicle
Use cache: enabled
Payload editor
Run test
```

Result card:

```txt
Status: Success / Failed
Normalized result: 3.42 kg CO₂e
From cache: Yes / No
Raw response:
{ ... }
```

Use a readable JSON viewer component.

If no JSON viewer exists, create a simple `<pre>` based viewer.

---

# 23. User-facing activity form

Add or update a normal user activity form separate from the playground.

It should support:

1. Vehicle
2. Electricity
3. Flight

User-facing labels should be friendly.

Do not show raw Carbon Interface variable names unless needed.

## Vehicle form

Fields:

```txt
Vehicle make
Vehicle model
Distance
Distance unit
```

Behavior:

1. Fetch vehicle makes from backend route.
2. When user selects a make, fetch models for that make.
3. Store selected `vehicle_model_id`.
4. Submit estimate using `vehicle_model_id`.

Fallback:

If the vehicle makes/models flow is too heavy for the MVP, allow a developer-provided default `vehicleModelId` and clearly mark the UI as a simple prototype.

## Electricity form

Fields:

```txt
Country code
State / province code
Electricity usage
Unit
```

Default for Carbon Interface should not be India unless the API supports India for electricity. Use `us` and a state such as `ny` as the default test example.

Important:

The app can still support India through CarbonSutra later, but Carbon Interface electricity examples should use supported country/state codes from the Carbon Interface docs.

## Flight form

Fields:

```txt
From airport
To airport
Passengers
Distance unit
```

Validation:

* airport codes must be 3 letters
* from and to cannot be same
* passengers must be at least 1

---

# 24. Dashboard updates

Update the dashboard to read from `ActivityLog`.

Add or update these metrics:

```txt
Today’s CO₂e
This week’s CO₂e
This month’s CO₂e
Top category
Recent activities
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
12 km by selected vehicle
3.42 kg CO₂e
Transport
Today
```

Do not show these technical fields on the normal dashboard:

* sourcePayload
* sourceResponse
* Authorization header
* API key
* raw response

---

# 25. Error handling requirements

Backend should handle:

* missing API key
* missing base URL
* invalid payload
* Carbon Interface API failure
* normalization failure
* database save failure
* cache read/write failure
* rate limits
* unauthenticated user
* playground disabled
* invalid vehicle make ID
* invalid vehicle model ID

Frontend should show friendly errors:

```txt
Could not calculate this activity right now. Please check the values and try again.
```

Developer playground should show technical errors:

```txt
Carbon Interface request failed with status 401
```

Do not log API keys.

Server logs may include:

```ts
{
  provider: "CARBON_INTERFACE",
  endpoint,
  payload,
  status,
  error
}
```

---

# 26. Security requirements

Strict requirements:

1. Never expose Carbon Interface API key to client components.
2. Never use `NEXT_PUBLIC_` for Carbon Interface secrets.
3. Never commit `.env.local`.
4. Use server-side API routes only.
5. Use Clerk authentication for user-facing activity logging.
6. Use Clerk authentication for developer playground.
7. Do not allow users to create logs for another user.
8. Block or hide `/dev/carbon-interface-playground` when `ENABLE_DEV_API_PLAYGROUND` is not true.
9. Do not display secrets in the playground.
10. Do not log API keys.
11. Do not return authorization headers to the frontend.

---

# 27. Testing requirements

After implementation, test the following:

## Test 1: Config status

Go to:

```txt
/dev/carbon-interface-playground
```

Expected:

* page loads only when enabled
* API key status is shown as configured/missing
* no secrets are displayed

## Test 2: Auth check

Call:

```txt
GET /api/dev/carbon-interface/config
```

Expected:

* returns whether the API key and base URL are configured
* does not return the actual API key

## Test 3: Vehicle makes

Use the playground to call vehicle makes.

Expected:

* returns list of vehicle makes
* no API key is exposed

## Test 4: Vehicle models

Select a make ID and call vehicle models.

Expected:

* returns list of models for the selected make
* each model includes an ID that can be used for vehicle estimates

## Test 5: Vehicle estimate

Payload:

```json
{
  "type": "vehicle",
  "distance_unit": "km",
  "distance_value": 12,
  "vehicle_model_id": "7268a9b7-17e8-4c8d-acca-57059252afe9"
}
```

Expected:

* Carbon Interface request succeeds if the model ID is valid
* raw response is visible
* normalized `co2eKg` appears
* no ActivityLog is created from playground test unless explicitly configured

## Test 6: Electricity estimate

Payload:

```json
{
  "type": "electricity",
  "electricity_unit": "kwh",
  "electricity_value": 180,
  "country": "us",
  "state": "ny"
}
```

Expected:

* Carbon Interface request succeeds if region is supported
* raw response is visible
* normalized result appears

## Test 7: Flight estimate

Payload:

```json
{
  "type": "flight",
  "passengers": 1,
  "legs": [
    {
      "departure_airport": "sfo",
      "destination_airport": "lax"
    }
  ],
  "distance_unit": "km"
}
```

Expected:

* Carbon Interface request succeeds
* response is visible
* normalized result appears

## Test 8: Shipping estimate

Payload:

```json
{
  "type": "shipping",
  "weight_unit": "kg",
  "weight_value": 1.5,
  "distance_unit": "km",
  "distance_value": 1200,
  "transport_method": "truck"
}
```

Expected:

* Carbon Interface request succeeds
* response is visible
* normalized result appears

## Test 9: Fuel combustion estimate

Payload:

```json
{
  "type": "fuel_combustion",
  "fuel_source_type": "dfo",
  "fuel_source_unit": "btu",
  "fuel_source_value": 50000
}
```

Expected:

* Carbon Interface request succeeds if fuel type/unit values are supported
* response is visible
* normalized result appears

## Test 10: User activity logging

Use normal app form.

Expected:

* user submits vehicle/electricity/flight activity
* backend calls Carbon Interface
* `ActivityLog` is created with real Clerk user ID
* dashboard updates

## Test 11: Cache

Submit the same payload twice.

Expected:

* first request calls Carbon Interface
* second request uses cache
* playground shows `fromCache: true`
* normal user route can still create separate ActivityLog entries while reusing cached estimate

---

# 28. Build and quality checks

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

# 29. Final output required from coding agent

After implementation, provide a summary with:

1. Files created
2. Files modified
3. Prisma migration name
4. Environment variables added
5. How to configure Carbon Interface API key
6. How to open the developer playground
7. How to test each Carbon Interface endpoint
8. Known assumptions about Carbon Interface payload fields
9. Any endpoints that could not be verified
10. Any remaining TODOs

---

# 30. Acceptance criteria

The task is complete only when:

* Carbon Interface API is called only from backend server-side code.
* API keys are not exposed.
* Vehicle, electricity, and flight estimates work in the normal app.
* Developer playground exists at `/dev/carbon-interface-playground`.
* Playground can test Carbon Interface estimates.
* Playground can test vehicle makes and vehicle models.
* Playground shows raw response, normalized result, errors, and cache status.
* Results are normalized into `co2eKg`.
* User-facing estimates are saved to `ActivityLog`.
* Dashboard reads from `ActivityLog`.
* Cache prevents duplicate Carbon Interface calls for the same payload.
* Clerk user ID is used for user activity logs.
* The app builds successfully.
* TypeScript has no errors.
* Prisma migration runs successfully.
* Existing design, fonts, colors, and layout are preserved.
