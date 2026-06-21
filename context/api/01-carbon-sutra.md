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

Your task is to implement **CarbonSutra** as the primary carbon emissions calculation provider and create a **developer API test playground** inside the app to test every CarbonSutra API call safely.

Do not redesign the app.
Do not change the existing color palette.
Do not change existing fonts.
Do not change the existing dashboard layout unless required to connect new data.
Do not change unrelated components.
Do not break authentication.
Do not break the database.
Do not expose API keys to the frontend.
Do not hardcode secrets.
Do not overcomplicate the implementation.

The goal is to make CarbonSutra work reliably as the main carbon engine for the app.

---

# 1. Main objective

Implement this complete flow:

User enters activity data
→ frontend sends request to internal Next.js API route
→ backend validates request
→ backend calls CarbonSutra using secure server-side credentials
→ backend normalizes CarbonSutra response into `co2eKg`
→ backend stores result in PostgreSQL using Prisma
→ dashboard reads stored activities
→ developer playground allows testing all CarbonSutra API calls

CarbonSutra must never be called directly from client components.

All CarbonSutra calls must go through server-side code.

---

# 2. CarbonSutra features to support

Implement CarbonSutra as a modular provider that can support these categories:

1. Vehicle emissions by type
2. Vehicle emissions by make/model
3. Electricity usage emissions
4. Flight emissions
5. Fuel emissions
6. Hotel stay emissions
7. Freight/shipping emissions
8. eCommerce shipment emissions

For the user-facing app, prioritize:

1. Vehicle by type
2. Electricity
3. Flights

For the developer playground, create test forms for all supported CarbonSutra endpoints listed above.

If an endpoint path is not configured in `.env.local`, the playground should show that endpoint as “Not configured” instead of crashing.

---

# 3. Important architecture rules

Follow this architecture:

```txt
Frontend form
→ /api/carbon/estimate
→ Carbon service
→ CarbonSutra client
→ CarbonSutra API
→ Normalize response
→ Cache result
→ Save ActivityLog
→ Return clean response to frontend
```

Create a separate developer testing flow:

```txt
Developer playground
→ /api/dev/carbonsutra/test
→ CarbonSutra client
→ Raw CarbonSutra response
→ Playground response viewer
```

The normal user-facing route should save data to the database.

The developer playground route should be able to test CarbonSutra calls without necessarily creating user activity logs.

---

# 4. Environment variables

Add support for these variables:

```env
CARBONSUTRA_API_KEY=
CARBONSUTRA_API_HOST=carbonsutra1.p.rapidapi.com
CARBONSUTRA_BASE_URL=https://carbonsutra1.p.rapidapi.com

CARBONSUTRA_VEHICLE_TYPE_PATH=
CARBONSUTRA_VEHICLE_MODEL_PATH=
CARBONSUTRA_ELECTRICITY_PATH=
CARBONSUTRA_FLIGHT_PATH=
CARBONSUTRA_FUEL_PATH=
CARBONSUTRA_HOTEL_PATH=
CARBONSUTRA_FREIGHT_PATH=
CARBONSUTRA_ECOMMERCE_SHIPMENT_PATH=

ENABLE_DEV_API_PLAYGROUND=true
```

Important:

* Do not hardcode endpoint paths.
* CarbonSutra endpoint paths should be copied from the RapidAPI Playground and placed in `.env.local`.
* If a path is missing, return a clear error.
* Do not expose these values to the client.
* Do not commit `.env.local`.
* Add `.env.example` with placeholder values only.

Example `.env.example`:

```env
CARBONSUTRA_API_KEY=your_rapidapi_key_here
CARBONSUTRA_API_HOST=carbonsutra1.p.rapidapi.com
CARBONSUTRA_BASE_URL=https://carbonsutra1.p.rapidapi.com

CARBONSUTRA_VEHICLE_TYPE_PATH=/paste-vehicle-type-path-here
CARBONSUTRA_VEHICLE_MODEL_PATH=/paste-vehicle-model-path-here
CARBONSUTRA_ELECTRICITY_PATH=/paste-electricity-path-here
CARBONSUTRA_FLIGHT_PATH=/paste-flight-path-here
CARBONSUTRA_FUEL_PATH=/paste-fuel-path-here
CARBONSUTRA_HOTEL_PATH=/paste-hotel-path-here
CARBONSUTRA_FREIGHT_PATH=/paste-freight-path-here
CARBONSUTRA_ECOMMERCE_SHIPMENT_PATH=/paste-ecommerce-shipment-path-here

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
        carbonsutra/
          test/
            route.ts
          config/
            route.ts

    dev/
      carbon-playground/
        page.tsx

  lib/
    carbonsutra/
      client.ts
      endpoints.ts
      normalize.ts
      types.ts
      cache.ts
      payload-builders.ts

  server/
    carbon/
      carbon.service.ts
      activity.service.ts

  components/
    carbon/
      CarbonActivityForm.tsx
      CarbonResultCard.tsx
      RecentCarbonActivities.tsx

    dev/
      CarbonSutraPlayground.tsx
      CarbonSutraEndpointTester.tsx
      JsonResponseViewer.tsx
```

If the project already has different conventions, follow the existing project conventions, but keep the same separation of responsibilities.

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
  provider          CalculationProvider @default(CARBONSUTRA)

  sourceEndpoint    String?
  sourcePayload     Json?
  sourceResponse    Json?

  confidence        CarbonEstimateConfidence @default(MEDIUM)
  calculationMethod String?

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([userId])
  @@index([category])
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

# 7. CarbonSutra types

Create:

`src/lib/carbonsutra/types.ts`

Add these types:

```ts
export type CarbonSutraEndpointKey =
  | "vehicleType"
  | "vehicleModel"
  | "electricity"
  | "flight"
  | "fuel"
  | "hotel"
  | "freight"
  | "ecommerceShipment";

export type CarbonSutraVehicleTypePayload = {
  VEHICLE_TYPE: string;
  DISTANCE_VALUE: number;
  DISTANCE_UNIT: "km" | "mi";
  FUEL_TYPE?: "Diesel" | "Petrol" | "Unknown";
  INCLUDE_WTT?: "Y" | "N";
};

export type CarbonSutraVehicleModelPayload = {
  VEHICLE_MAKE: string;
  VEHICLE_MODEL: string;
  DISTANCE_VALUE: number;
  DISTANCE_UNIT: "km" | "mi";
  INCLUDE_WTT?: "Y" | "N";
};

export type CarbonSutraElectricityPayload = {
  COUNTRY_NAME: string;
  ELECTRICITY_VALUE: number;
  ELECTRICITY_UNIT: "kWh" | "MWh";
};

export type CarbonSutraFlightPayload = {
  IATA_AIRPORT_FROM: string;
  IATA_AIRPORT_TO: string;
  FLIGHT_CLASS?: "Economy" | "Premium" | "Business" | "First" | "Average";
  ROUND_TRIP?: "Y" | "N";
  ADD_RF?: "Y" | "N";
  INCLUDE_WTT?: "Y" | "N";
  NUMBER_OF_PASSENGERS?: number;
};

export type CarbonSutraFuelPayload = {
  FUEL_TYPE: string;
  FUEL_VALUE: number;
  FUEL_UNIT: string;
  INCLUDE_WTT?: "Y" | "N";
};

export type CarbonSutraHotelPayload = {
  COUNTRY_NAME: string;
  CITY_NAME?: string;
  HOTEL_RATING?: string;
  NUMBER_OF_NIGHTS: number;
  NUMBER_OF_ROOMS?: number;
};

export type CarbonSutraFreightPayload = {
  TRANSPORT_METHOD: string;
  DISTANCE_VALUE: number;
  DISTANCE_UNIT: "km" | "mi";
  WEIGHT_VALUE: number;
  WEIGHT_UNIT: "kg" | "tonne" | "lb";
  INCLUDE_WTT?: "Y" | "N";
};

export type CarbonSutraEcommerceShipmentPayload = {
  ORIGIN_COUNTRY_CODE: string;
  DESTINATION_COUNTRY_CODE: string;
  ORIGIN_POSTAL_CODE?: string;
  DESTINATION_POSTAL_CODE?: string;
  PACKAGE_WEIGHT_VALUE: number;
  PACKAGE_WEIGHT_UNIT: "kg" | "g" | "lb";
  INCLUDE_RF?: "Y" | "N";
  INCLUDE_WTT?: "Y" | "N";
};

export type CarbonSutraPayload =
  | CarbonSutraVehicleTypePayload
  | CarbonSutraVehicleModelPayload
  | CarbonSutraElectricityPayload
  | CarbonSutraFlightPayload
  | CarbonSutraFuelPayload
  | CarbonSutraHotelPayload
  | CarbonSutraFreightPayload
  | CarbonSutraEcommerceShipmentPayload;

export type NormalizedCarbonEstimate = {
  co2eKg: number;
  provider: "CARBONSUTRA";
  endpoint: CarbonSutraEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};
```

If the real CarbonSutra API expects slightly different field names, update the types and payload builders after testing with the RapidAPI Playground.

---

# 8. Endpoint configuration

Create:

`src/lib/carbonsutra/endpoints.ts`

```ts
import type { CarbonSutraEndpointKey } from "./types";

export const CARBONSUTRA_ENDPOINTS: Record<CarbonSutraEndpointKey, string | undefined> = {
  vehicleType: process.env.CARBONSUTRA_VEHICLE_TYPE_PATH,
  vehicleModel: process.env.CARBONSUTRA_VEHICLE_MODEL_PATH,
  electricity: process.env.CARBONSUTRA_ELECTRICITY_PATH,
  flight: process.env.CARBONSUTRA_FLIGHT_PATH,
  fuel: process.env.CARBONSUTRA_FUEL_PATH,
  hotel: process.env.CARBONSUTRA_HOTEL_PATH,
  freight: process.env.CARBONSUTRA_FREIGHT_PATH,
  ecommerceShipment: process.env.CARBONSUTRA_ECOMMERCE_SHIPMENT_PATH,
};

export function getCarbonSutraEndpointPath(endpoint: CarbonSutraEndpointKey) {
  const path = CARBONSUTRA_ENDPOINTS[endpoint];

  if (!path) {
    throw new Error(`CarbonSutra endpoint path is not configured for: ${endpoint}`);
  }

  return path;
}

export function getCarbonSutraEndpointStatus() {
  return Object.entries(CARBONSUTRA_ENDPOINTS).map(([key, path]) => ({
    endpoint: key,
    configured: Boolean(path),
  }));
}
```

---

# 9. CarbonSutra client

Create:

`src/lib/carbonsutra/client.ts`

Requirements:

* Server-side only.
* Uses `fetch`.
* Uses `POST`.
* Reads secrets from environment variables.
* Uses RapidAPI headers.
* Uses `cache: "no-store"`.
* Throws useful errors.
* Never logs API key.
* Returns raw JSON response.

Implementation:

```ts
import "server-only";

type CarbonSutraRequestOptions = {
  path: string;
  payload: Record<string, unknown>;
};

export async function callCarbonSutra({
  path,
  payload,
}: CarbonSutraRequestOptions) {
  const baseUrl = process.env.CARBONSUTRA_BASE_URL;
  const apiKey = process.env.CARBONSUTRA_API_KEY;
  const apiHost = process.env.CARBONSUTRA_API_HOST;

  if (!baseUrl || !apiKey || !apiHost) {
    throw new Error("Missing CarbonSutra environment variables");
  }

  if (!path) {
    throw new Error("Missing CarbonSutra endpoint path");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("CarbonSutra request failed", {
      status: response.status,
      path,
      payload,
      response: data,
    });

    throw new Error(
      `CarbonSutra request failed with status ${response.status}`
    );
  }

  return data;
}
```

---

# 10. Response normalization

Create:

`src/lib/carbonsutra/normalize.ts`

The entire app should use `co2eKg` internally.

CarbonSutra response shape may vary by endpoint, so first implement a defensive extractor.

```ts
export function extractCo2eKg(response: any): number {
  const possibleValues = [
    response?.co2eKg,
    response?.co2e_kg,
    response?.CO2E_KG,
    response?.carbon_kg,
    response?.carbonKg,
    response?.emission_kg,
    response?.emissionKg,
    response?.total_emission_kg,
    response?.totalEmissionKg,
    response?.data?.co2eKg,
    response?.data?.co2e_kg,
    response?.data?.CO2E_KG,
    response?.data?.carbon_kg,
    response?.data?.carbonKg,
    response?.data?.emission_kg,
    response?.data?.total_emission_kg,
    response?.result?.co2eKg,
    response?.result?.carbon_kg,
    response?.result?.emission_kg,
  ];

  const value = possibleValues.find(
    (item) => typeof item === "number" && Number.isFinite(item)
  );

  if (value === undefined) {
    throw new Error(
      `Could not extract CO2e kg from CarbonSutra response: ${JSON.stringify(
        response
      )}`
    );
  }

  return value;
}
```

After testing the real API response, replace this with exact extraction logic per endpoint.

Also support string values if CarbonSutra returns numbers as strings:

```ts
export function parsePossibleNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}
```

Use this helper to make normalization more robust.

---

# 11. Cache helper

Create:

`src/lib/carbonsutra/cache.ts`

```ts
import crypto from "crypto";

export function createCarbonCacheKey(input: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}
```

Cache key should include:

```ts
{
  provider: "CARBONSUTRA",
  endpoint,
  payload
}
```

Service behavior:

1. Build payload.
2. Generate cache key.
3. Check `CarbonEstimateCache`.
4. If found, return cached `co2eKg` and `fromCache: true`.
5. If not found, call CarbonSutra.
6. Normalize result.
7. Save result to cache.
8. Return result with `fromCache: false`.

This is required because CarbonSutra free tier is limited.

---

# 12. Payload builders

Create:

`src/lib/carbonsutra/payload-builders.ts`

Add builder functions that convert app-friendly input into CarbonSutra payloads.

Example:

```ts
export function buildVehicleTypePayload(input: {
  vehicleType: string;
  distanceValue: number;
  distanceUnit: "km" | "mi";
  fuelType?: "Diesel" | "Petrol" | "Unknown";
  includeWtt?: boolean;
}) {
  return {
    VEHICLE_TYPE: input.vehicleType,
    DISTANCE_VALUE: input.distanceValue,
    DISTANCE_UNIT: input.distanceUnit,
    FUEL_TYPE: input.fuelType ?? "Unknown",
    INCLUDE_WTT: input.includeWtt === false ? "N" : "Y",
  };
}
```

Add builders for:

* vehicle type
* vehicle model
* electricity
* flight
* fuel
* hotel
* freight
* ecommerce shipment

Do not expose CarbonSutra field names in user-facing UI.

---

# 13. Carbon service

Create:

`src/server/carbon/carbon.service.ts`

Implement these functions:

```ts
estimateVehicleByType()
estimateVehicleByModel()
estimateElectricity()
estimateFlight()
estimateFuel()
estimateHotel()
estimateFreight()
estimateEcommerceShipment()
estimateCarbonWithCarbonSutra()
```

Each function should return:

```ts
{
  co2eKg: number;
  provider: "CARBONSUTRA";
  endpoint: string;
  payload: object;
  response: object;
  fromCache: boolean;
}
```

Create a generic internal helper:

```ts
async function estimateWithCarbonSutra({
  endpoint,
  payload,
}: {
  endpoint: CarbonSutraEndpointKey;
  payload: Record<string, unknown>;
})
```

This helper should:

1. Get endpoint path.
2. Create cache key.
3. Check cache.
4. Call CarbonSutra if cache miss.
5. Normalize response.
6. Store cache.
7. Return normalized estimate.

---

# 14. User-facing API route

Create:

`src/app/api/carbon/estimate/route.ts`

This route is for normal app usage and should save results to `ActivityLog`.

Requirements:

* Use `POST`.
* Use Clerk authentication.
* Reject unauthenticated users.
* Use `zod` validation.
* Support at least:

  * `TRANSPORT`
  * `ELECTRICITY`
  * `FLIGHT`
* Optionally support:

  * `FUEL`
  * `HOTEL`
  * `SHIPPING`
* Store result in `ActivityLog`.
* Return a clean response.
* Do not return API secrets.
* Do not expose full raw CarbonSutra response to normal users unless needed for debugging.

Request examples:

Transport:

```json
{
  "category": "TRANSPORT",
  "method": "vehicleType",
  "vehicleType": "Car-Size-Average",
  "distanceValue": 12,
  "distanceUnit": "km",
  "fuelType": "Petrol",
  "includeWtt": true
}
```

Electricity:

```json
{
  "category": "ELECTRICITY",
  "countryName": "India",
  "electricityValue": 180,
  "electricityUnit": "kWh"
}
```

Flight:

```json
{
  "category": "FLIGHT",
  "from": "BOM",
  "to": "DEL",
  "flightClass": "Economy",
  "roundTrip": true,
  "includeRadiativeForcing": true,
  "includeWtt": true,
  "passengers": 1
}
```

Expected response:

```json
{
  "activity": {
    "id": "...",
    "category": "TRANSPORT",
    "activityType": "Car-Size-Average",
    "co2eKg": 3.42,
    "provider": "CARBONSUTRA",
    "createdAt": "..."
  },
  "estimate": {
    "co2eKg": 3.42,
    "fromCache": false
  }
}
```

---

# 15. Developer-only CarbonSutra test route

Create:

`src/app/api/dev/carbonsutra/test/route.ts`

This route is for testing CarbonSutra calls from the playground.

Requirements:

* Use `POST`.
* Only enabled when `ENABLE_DEV_API_PLAYGROUND=true`.
* Should be blocked in production unless explicitly enabled.
* Should require the user to be authenticated.
* Ideally only allow the app owner/admin user.
* Does not save ActivityLog by default.
* Calls CarbonSutra and returns:

  * endpoint name
  * request payload
  * normalized `co2eKg` if extractable
  * raw response
  * fromCache status
  * errors if any

Request shape:

```json
{
  "endpoint": "vehicleType",
  "payload": {
    "VEHICLE_TYPE": "Car-Size-Average",
    "DISTANCE_VALUE": 12,
    "DISTANCE_UNIT": "km",
    "FUEL_TYPE": "Petrol",
    "INCLUDE_WTT": "Y"
  },
  "useCache": true
}
```

Response shape:

```json
{
  "ok": true,
  "endpoint": "vehicleType",
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
  "endpoint": "vehicleType",
  "error": "CarbonSutra endpoint path is not configured for: vehicleType"
}
```

---

# 16. Developer config route

Create:

`src/app/api/dev/carbonsutra/config/route.ts`

This route should return endpoint configuration status only, not secrets.

Response:

```json
{
  "enabled": true,
  "baseUrlConfigured": true,
  "apiKeyConfigured": true,
  "hostConfigured": true,
  "endpoints": [
    {
      "endpoint": "vehicleType",
      "configured": true
    },
    {
      "endpoint": "electricity",
      "configured": true
    },
    {
      "endpoint": "flight",
      "configured": false
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

# 17. Developer API playground page

Create a developer-only playground page:

```txt
/dev/carbon-playground
```

Purpose:

Allow me to test all CarbonSutra API calls from the UI.

The page should be simple, clean, and clearly marked as a developer tool.

Do not mix this with the normal user dashboard.

The playground should have:

1. API configuration status card
2. Endpoint selector
3. Prebuilt test forms for every endpoint
4. Raw JSON editor
5. Submit button
6. Response viewer
7. Normalized `co2eKg` display
8. Cache status display
9. Error display
10. Copy response button
11. Clear response button

Use existing design system.

Do not make it childish.
Do not add unnecessary animations.
Do not overdesign it.

---

# 18. Playground endpoint tabs

The playground should include tabs or dropdown options for:

```txt
Vehicle by Type
Vehicle by Model
Electricity
Flight
Fuel
Hotel Stay
Freight / Shipping
eCommerce Shipment
```

Each tab should have a sample payload.

## Vehicle by Type sample

```json
{
  "VEHICLE_TYPE": "Car-Size-Average",
  "DISTANCE_VALUE": 12,
  "DISTANCE_UNIT": "km",
  "FUEL_TYPE": "Petrol",
  "INCLUDE_WTT": "Y"
}
```

## Vehicle by Model sample

```json
{
  "VEHICLE_MAKE": "Toyota",
  "VEHICLE_MODEL": "Corolla",
  "DISTANCE_VALUE": 12,
  "DISTANCE_UNIT": "km",
  "INCLUDE_WTT": "Y"
}
```

## Electricity sample

```json
{
  "COUNTRY_NAME": "India",
  "ELECTRICITY_VALUE": 180,
  "ELECTRICITY_UNIT": "kWh"
}
```

## Flight sample

```json
{
  "IATA_AIRPORT_FROM": "BOM",
  "IATA_AIRPORT_TO": "DEL",
  "FLIGHT_CLASS": "Economy",
  "ROUND_TRIP": "Y",
  "ADD_RF": "Y",
  "INCLUDE_WTT": "Y",
  "NUMBER_OF_PASSENGERS": 1
}
```

## Fuel sample

```json
{
  "FUEL_TYPE": "Petrol",
  "FUEL_VALUE": 20,
  "FUEL_UNIT": "litre",
  "INCLUDE_WTT": "Y"
}
```

## Hotel sample

```json
{
  "COUNTRY_NAME": "India",
  "CITY_NAME": "Mumbai",
  "HOTEL_RATING": "Average",
  "NUMBER_OF_NIGHTS": 2,
  "NUMBER_OF_ROOMS": 1
}
```

## Freight sample

```json
{
  "TRANSPORT_METHOD": "road",
  "DISTANCE_VALUE": 120,
  "DISTANCE_UNIT": "km",
  "WEIGHT_VALUE": 10,
  "WEIGHT_UNIT": "kg",
  "INCLUDE_WTT": "Y"
}
```

## eCommerce shipment sample

```json
{
  "ORIGIN_COUNTRY_CODE": "IN",
  "DESTINATION_COUNTRY_CODE": "IN",
  "ORIGIN_POSTAL_CODE": "400001",
  "DESTINATION_POSTAL_CODE": "110001",
  "PACKAGE_WEIGHT_VALUE": 1.5,
  "PACKAGE_WEIGHT_UNIT": "kg",
  "INCLUDE_RF": "N",
  "INCLUDE_WTT": "Y"
}
```

Important:

If the actual CarbonSutra docs or RapidAPI Playground require different field names, update the sample payloads to match the real API.

---

# 19. Playground UI details

The playground should show:

```txt
CarbonSutra API Playground
Developer tool for testing CarbonSutra emission endpoints.
```

Configuration card:

```txt
API key: Configured / Missing
API host: Configured / Missing
Base URL: Configured / Missing
Vehicle Type endpoint: Configured / Missing
Electricity endpoint: Configured / Missing
Flight endpoint: Configured / Missing
...
```

Endpoint test card:

```txt
Endpoint: Vehicle by Type
Status: Configured
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

# 20. User-facing activity form

Add or update a normal user activity form separate from the playground.

It should support:

1. Commute
2. Electricity
3. Flight

User-facing labels should be friendly.

Do not show raw CarbonSutra variable names.

## Commute form

Fields:

```txt
Transport type
Fuel type
Distance
Distance unit
```

Map UI labels to CarbonSutra values:

```ts
const vehicleTypeMap = {
  "Small car": "Car-Size-Small",
  "Medium car": "Car-Size-Medium",
  "Large car": "Car-Size-Large",
  "Average car": "Car-Size-Average",
  "Small motorbike": "Motorbike-Size-Small",
  "Medium motorbike": "Motorbike-Size-Medium",
  "Large motorbike": "Motorbike-Size-Large",
  "Local bus": "Bus-LocalAverage",
  "Local taxi": "Taxi-Local",
  "National train": "Train-National",
  "Local train": "Train-Local",
  "Tram": "Train-Tram"
};
```

## Electricity form

Fields:

```txt
Country
Electricity usage
Unit
```

Default country: India.

## Flight form

Fields:

```txt
From airport
To airport
Flight class
Round trip
Passengers
```

Validation:

* airport codes must be 3 letters
* from and to cannot be same
* passengers must be at least 1
* distance must be positive
* electricity usage must be positive

---

# 21. Dashboard updates

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
12 km by petrol car
3.42 kg CO₂e
Transport
Today
```

Do not show these technical fields on the normal dashboard:

* sourcePayload
* sourceResponse
* CarbonSutra endpoint path
* API headers
* raw response

---

# 22. Error handling requirements

Backend should handle:

* missing API key
* missing API host
* missing base URL
* missing endpoint path
* invalid payload
* CarbonSutra API failure
* normalization failure
* database save failure
* cache read/write failure
* rate limits
* unauthenticated user
* playground disabled

Frontend should show friendly errors:

```txt
Could not calculate this activity right now. Please check the values and try again.
```

Developer playground should show technical errors:

```txt
CarbonSutra endpoint path is not configured for: flight
```

Do not log API keys.

Server logs may include:

```ts
{
  provider: "CARBONSUTRA",
  endpoint,
  payload,
  status,
  error
}
```

---

# 23. Security requirements

Strict requirements:

1. Never expose CarbonSutra API key to client components.
2. Never use `NEXT_PUBLIC_` for CarbonSutra secrets.
3. Never commit `.env.local`.
4. Use server-side API routes only.
5. Use Clerk authentication for user-facing activity logging.
6. Use Clerk authentication for developer playground.
7. Do not allow users to create logs for another user.
8. Block or hide `/dev/carbon-playground` when `ENABLE_DEV_API_PLAYGROUND` is not true.
9. Do not display secrets in the playground.
10. Do not log API keys.
11. Do not return API headers to the frontend.

---

# 24. Testing requirements

After implementation, test the following:

## Test 1: Config status

Go to:

```txt
/dev/carbon-playground
```

Expected:

* page loads only when enabled
* API key status is shown as configured/missing
* endpoint status is shown
* no secrets are displayed

## Test 2: Vehicle by type

Payload:

```json
{
  "VEHICLE_TYPE": "Car-Size-Average",
  "DISTANCE_VALUE": 12,
  "DISTANCE_UNIT": "km",
  "FUEL_TYPE": "Petrol",
  "INCLUDE_WTT": "Y"
}
```

Expected:

* CarbonSutra request succeeds
* raw response is visible
* normalized `co2eKg` appears if response contains an extractable value
* no ActivityLog is created from playground test unless explicitly configured

## Test 3: Electricity

Payload:

```json
{
  "COUNTRY_NAME": "India",
  "ELECTRICITY_VALUE": 180,
  "ELECTRICITY_UNIT": "kWh"
}
```

Expected:

* CarbonSutra request succeeds
* response is visible
* normalized result appears

## Test 4: Flight

Payload:

```json
{
  "IATA_AIRPORT_FROM": "BOM",
  "IATA_AIRPORT_TO": "DEL",
  "FLIGHT_CLASS": "Economy",
  "ROUND_TRIP": "Y",
  "ADD_RF": "Y",
  "INCLUDE_WTT": "Y",
  "NUMBER_OF_PASSENGERS": 1
}
```

Expected:

* CarbonSutra request succeeds
* response is visible
* normalized result appears

## Test 5: User activity logging

Use normal app form.

Expected:

* user submits commute/electricity/flight activity
* backend calls CarbonSutra
* `ActivityLog` is created with real Clerk user ID
* dashboard updates

## Test 6: Cache

Submit the same payload twice.

Expected:

* first request calls CarbonSutra
* second request uses cache
* playground shows `fromCache: true`
* normal user route can still create separate ActivityLog entries while reusing cached estimate

## Test 7: Missing endpoint

Remove one endpoint path from `.env.local`.

Expected:

* app does not crash
* config page shows endpoint as missing
* playground shows “Not configured”
* test route returns clear error

---

# 25. Build and quality checks

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

# 26. Final output required from coding agent

After implementation, provide a summary with:

1. Files created
2. Files modified
3. Prisma migration name
4. Environment variables added
5. How to configure CarbonSutra endpoint paths
6. How to open the developer playground
7. How to test each CarbonSutra endpoint
8. Known assumptions about CarbonSutra payload fields
9. Any endpoints that could not be verified
10. Any remaining TODOs

---

# 27. Acceptance criteria

The task is complete only when:

* CarbonSutra API is called only from backend server-side code.
* API keys are not exposed.
* Vehicle, electricity, and flight estimates work in the normal app.
* Developer playground exists at `/dev/carbon-playground`.
* Playground can test all configured CarbonSutra endpoints.
* Playground shows raw response, normalized result, errors, and cache status.
* Missing endpoint paths do not crash the app.
* Results are normalized into `co2eKg`.
* User-facing estimates are saved to `ActivityLog`.
* Dashboard reads from `ActivityLog`.
* Cache prevents duplicate CarbonSutra calls for the same payload.
* Clerk user ID is used for user activity logs.
* The app builds successfully.
* TypeScript has no errors.
* Prisma migration runs successfully.
* Existing design, fonts, colors, and layout are preserved.
