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
* Existing support APIs:

  * OpenRouteService
  * Open Food Facts
* Existing dashboard, activity tracking, gamification, product scanning, and carbon progress features

Your task is to implement **Agribalyse** as the app’s local food Life Cycle Assessment dataset provider.

Agribalyse should be used for food and agricultural product carbon estimates, especially when a user scans or logs food products.

Agribalyse is not a normal API-key service. Treat it as a dataset integration:

Dataset file
→ import script
→ database tables
→ food/category matching
→ estimate kg CO₂e
→ ActivityLog
→ dashboard

Do not redesign the app.
Do not change the existing color palette.
Do not change existing fonts.
Do not change unrelated components.
Do not break authentication.
Do not break the database.
Do not expose unnecessary raw dataset details to normal users.
Do not invent carbon values.
Do not use AI to generate carbon numbers.

---

# 1. Main objective

Implement this complete Agribalyse flow:

Developer imports Agribalyse dataset
→ app parses and normalizes food LCA rows
→ app stores food impact factors in PostgreSQL
→ user scans food barcode or logs food manually
→ app maps product/category to Agribalyse food factor
→ app estimates food carbon using quantity
→ app creates ActivityLog
→ dashboard shows food emissions

Agribalyse should become the main source for:

```txt
food carbon estimates
meal category estimates
food product category estimates
ingredient/category approximations
Open Food Facts category-to-carbon mapping
```

Agribalyse should not be used for:

```txt
transport
electricity
flight
fuel
hotel
route distance
AI recommendations
```

Those are handled by:

```txt
CarbonSutra / Carbon Interface / Climatiq = general carbon calculations
OpenRouteService = route distance
Open Food Facts = product/barcode lookup
OpenAI = explanations, parsing, summaries, and missions
```

---

# 2. Agribalyse implementation principle

Agribalyse should be implemented as a **local database-backed provider**.

The app should support:

```txt
1. Import Agribalyse CSV/XLSX file
2. Normalize dataset rows
3. Store food impact factors
4. Search food factors
5. Match Open Food Facts product/category to Agribalyse row
6. Estimate kg CO₂e based on product quantity
7. Save food carbon ActivityLog
8. Show missing mapping warnings
9. Provide a developer playground for testing mappings
```

The app should never fake a value.

If no match exists, return:

```txt
Food product found, but no reliable Agribalyse factor mapping exists yet.
```

---

# 3. Agribalyse data source assumptions

Agribalyse may be provided as:

```txt
CSV
XLSX
ODS
downloaded dataset file
manual export from Dataverse
simplified impact factor table
```

The implementation should not assume exact column names forever.

Instead, create a flexible import mapper that can handle common column aliases.

The app should look for fields like:

```txt
food name
food code
CIQUAL code
Agribalyse ID
product category
sub-category
climate change impact
kg CO₂e per kg
unit
version
source
```

Developer must inspect actual headers during import and map them through a configurable column-mapping step.

---

# 4. Required environment variables

Add:

```env
AGRIBALYSE_DATA_VERSION=3.2
AGRIBALYSE_SOURCE_NAME=AGRIBALYSE
ENABLE_DEV_API_PLAYGROUND=true
```

Add to `.env.example`:

```env
AGRIBALYSE_DATA_VERSION=3.2
AGRIBALYSE_SOURCE_NAME=AGRIBALYSE
ENABLE_DEV_API_PLAYGROUND=false
```

Agribalyse does not need an API key for local dataset usage.

Do not add fake API key variables.

---

# 5. Required folder structure

Create or update this structure:

```txt
src/
  app/
    api/
      food/
        agribalyse/
          search/
            route.ts
          estimate/
            route.ts
          mappings/
            route.ts
          import/
            route.ts
          stats/
            route.ts

      dev/
        agribalyse/
          config/
            route.ts
          import-preview/
            route.ts
          import-confirm/
            route.ts
          search/
            route.ts
          estimate/
            route.ts
          mappings/
            route.ts

    dev/
      agribalyse-playground/
        page.tsx

  lib/
    agribalyse/
      constants.ts
      types.ts
      normalize.ts
      import-parser.ts
      column-mapper.ts
      matching.ts
      estimate.ts
      validators.ts

  server/
    food/
      agribalyse-import.service.ts
      agribalyse-search.service.ts
      agribalyse-estimate.service.ts
      food-mapping.service.ts
      food-activity.service.ts

  components/
    food/
      FoodEstimateForm.tsx
      FoodFactorSearch.tsx
      FoodCarbonEstimateCard.tsx
      FoodMappingNotice.tsx
      FoodActivityHistory.tsx

    dev/
      AgribalysePlayground.tsx
      AgribalyseImportPanel.tsx
      AgribalyseSearchPanel.tsx
      AgribalyseEstimateTester.tsx
      AgribalyseMappingPanel.tsx
      JsonResponseViewer.tsx

  scripts/
    import-agribalyse.ts

  data/
    agribalyse/
      README.md
      .gitkeep
```

Do not commit large dataset files unless the project explicitly allows it.

Add `data/agribalyse/*.csv`, `*.xlsx`, and `*.ods` to `.gitignore` if needed.

---

# 6. Prisma schema requirements

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
  AGRIBALYSE
  MANUAL
  OPEN_FOOD_FACTS
}

enum CarbonEstimateConfidence {
  LOW
  MEDIUM
  HIGH
}
```

Create model:

```prisma
model AgribalyseFoodFactor {
  id                    String   @id @default(cuid())

  agribalyseId           String?
  ciqualCode             String?
  foodCode               String?

  name                   String
  nameFr                 String?
  nameEn                 String?

  category               String?
  subCategory            String?
  groupName              String?

  climateChangeKgCo2ePerKg Float

  unit                   String   @default("kg")
  source                 String   @default("AGRIBALYSE")
  version                String?

  rawRow                 Json?
  metadata               Json?

  isActive               Boolean  @default(true)

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@index([agribalyseId])
  @@index([ciqualCode])
  @@index([foodCode])
  @@index([name])
  @@index([category])
  @@index([subCategory])
  @@index([source])
  @@index([version])
  @@index([isActive])
}
```

Create model:

```prisma
model FoodFactorMapping {
  id                    String   @id @default(cuid())

  provider              String   @default("AGRIBALYSE")

  appCategory           String
  appActivityType       String?

  openFoodFactsTag      String?
  openFoodFactsCategory String?

  label                 String
  description           String?

  agribalyseFoodFactorId String?
  agribalyseName        String?
  agribalyseCode        String?

  defaultQuantityKg     Float?
  confidence            CarbonEstimateConfidence @default(MEDIUM)

  isActive              Boolean  @default(true)

  metadata              Json?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([provider])
  @@index([appCategory])
  @@index([appActivityType])
  @@index([openFoodFactsTag])
  @@index([agribalyseFoodFactorId])
  @@index([isActive])
}
```

Create model:

```prisma
model AgribalyseImportJob {
  id               String   @id @default(cuid())

  filename         String?
  version          String?
  source           String   @default("AGRIBALYSE")

  status           String   // PENDING, PREVIEWED, IMPORTING, COMPLETED, FAILED

  totalRows        Int      @default(0)
  validRows        Int      @default(0)
  invalidRows      Int      @default(0)
  importedRows     Int      @default(0)

  columnMapping    Json?
  previewRows      Json?
  errorLog         Json?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([status])
  @@index([version])
  @@index([createdAt])
}
```

If `ActivityLog` already exists, ensure it supports:

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
weightValue
weightUnit
```

After schema update:

```bash
npx prisma format
npx prisma migrate dev
npx prisma generate
```

---

# 7. Agribalyse types

Create:

`src/lib/agribalyse/types.ts`

```ts
export type AgribalyseRawRow = Record<string, unknown>;

export type AgribalyseColumnMapping = {
  agribalyseId?: string;
  ciqualCode?: string;
  foodCode?: string;

  name: string;
  nameFr?: string;
  nameEn?: string;

  category?: string;
  subCategory?: string;
  groupName?: string;

  climateChangeKgCo2ePerKg: string;

  unit?: string;
};

export type NormalizedAgribalyseFoodFactor = {
  agribalyseId?: string;
  ciqualCode?: string;
  foodCode?: string;

  name: string;
  nameFr?: string;
  nameEn?: string;

  category?: string;
  subCategory?: string;
  groupName?: string;

  climateChangeKgCo2ePerKg: number;

  unit: "kg";
  source: "AGRIBALYSE";
  version?: string;

  rawRow: AgribalyseRawRow;
};

export type AgribalyseEstimateInput = {
  factorId: string;
  quantityKg: number;
  createActivityLog?: boolean;
  userId?: string;
  sourceContext?: "MANUAL_FOOD_LOG" | "BARCODE_SCAN" | "RECEIPT" | "MEAL";
};

export type AgribalyseEstimateResult = {
  status: "ESTIMATED" | "FACTOR_NOT_FOUND" | "INVALID_QUANTITY" | "ERROR";
  co2eKg?: number;
  quantityKg?: number;
  factor?: {
    id: string;
    name: string;
    category?: string;
    climateChangeKgCo2ePerKg: number;
    version?: string;
  };
  provider: "AGRIBALYSE";
  confidence: "LOW" | "MEDIUM" | "HIGH";
  message?: string;
};
```

---

# 8. Constants

Create:

`src/lib/agribalyse/constants.ts`

```ts
export const AGRIBALYSE_PROVIDER = "AGRIBALYSE" as const;

export const DEFAULT_AGRIBALYSE_VERSION =
  process.env.AGRIBALYSE_DATA_VERSION || "3.2";

export const AGRIBALYSE_UNIT = "kg";

export const AGRIBALYSE_COLUMN_ALIASES = {
  agribalyseId: [
    "agribalyse_id",
    "Agribalyse ID",
    "ID",
    "id",
  ],
  ciqualCode: [
    "ciqual_code",
    "CIQUAL code",
    "Code CIQUAL",
    "ciqual",
  ],
  foodCode: [
    "food_code",
    "Food code",
    "Code",
  ],
  name: [
    "name",
    "Name",
    "Food name",
    "Nom du Produit",
    "Nom",
    "LCI Name",
    "Product name",
  ],
  category: [
    "category",
    "Category",
    "Groupe",
    "Group",
    "Food group",
  ],
  subCategory: [
    "sub_category",
    "Sub-category",
    "Sous-groupe",
    "Sub group",
  ],
  climateChangeKgCo2ePerKg: [
    "climate_change",
    "Climate change",
    "kg CO2 eq/kg",
    "kgCO2e/kg",
    "Climate change kg CO2 eq/kg",
    "Changement climatique",
    "EF 3.1",
    "Score unique EF",
  ],
};
```

The actual headers may differ. The importer must show detected headers and allow manual mapping in the developer playground.

---

# 9. Import parser

Create:

`src/lib/agribalyse/import-parser.ts`

Requirements:

* Support CSV first.
* Support XLSX if the project already has a spreadsheet parser.
* For CSV, use a reliable parser such as `csv-parse` or existing project dependency.
* Do not parse huge files in the frontend.
* Import should happen server-side.
* For MVP, support upload preview and import confirmation.

Functions:

```ts
parseAgribalyseCsv(buffer: Buffer): Promise<AgribalyseRawRow[]>
parseAgribalyseXlsx(buffer: Buffer): Promise<AgribalyseRawRow[]>
detectAgribalyseColumns(rows: AgribalyseRawRow[]): Partial<AgribalyseColumnMapping>
```

The parser should:

```txt
1. Read headers
2. Return first 10 preview rows
3. Detect likely column mapping
4. Count total rows
5. Report missing required fields
```

Required fields:

```txt
name
climateChangeKgCo2ePerKg
```

Optional fields:

```txt
agribalyseId
ciqualCode
foodCode
category
subCategory
unit
```

---

# 10. Column mapper

Create:

`src/lib/agribalyse/column-mapper.ts`

Implement:

```ts
export function detectColumnMapping(headers: string[]): Partial<AgribalyseColumnMapping>
export function validateColumnMapping(mapping: Partial<AgribalyseColumnMapping>): {
  valid: boolean;
  missing: string[];
}
export function mapRawRowToNormalizedFactor(input: {
  row: AgribalyseRawRow;
  mapping: AgribalyseColumnMapping;
  version?: string;
}): NormalizedAgribalyseFoodFactor | null
```

Normalization rules:

```txt
Trim names
Parse decimal numbers safely
Support comma decimals, e.g. "1,23" → 1.23
Reject rows where climate factor is missing or invalid
Reject rows where name is missing
Set unit to "kg"
Store raw row for traceability
```

Number parser:

```ts
export function parseLocalizedNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const cleaned = value.trim().replace(",", ".");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}
```

---

# 11. Agribalyse import service

Create:

`src/server/food/agribalyse-import.service.ts`

Implement:

```ts
createAgribalyseImportPreview()
confirmAgribalyseImport()
getAgribalyseImportJob()
listAgribalyseImportJobs()
```

## createAgribalyseImportPreview

Input:

```ts
{
  file: File | Buffer;
  filename: string;
  version?: string;
}
```

Flow:

```txt
1. Parse file server-side.
2. Detect headers.
3. Create AgribalyseImportJob with status PREVIEWED.
4. Store preview rows and detected mapping.
5. Return jobId, headers, detected mapping, preview rows, total rows.
```

## confirmAgribalyseImport

Input:

```ts
{
  jobId: string;
  columnMapping: AgribalyseColumnMapping;
  version: string;
  replaceExistingVersion?: boolean;
}
```

Flow:

```txt
1. Load import job.
2. Validate column mapping.
3. Parse file or use stored temporary reference.
4. Normalize rows.
5. If replaceExistingVersion is true, deactivate existing factors for version.
6. Upsert AgribalyseFoodFactor rows.
7. Update job status COMPLETED.
8. Return import summary.
```

For MVP, if temporary file persistence is hard, implement a script-based import instead:

```bash
npx tsx scripts/import-agribalyse.ts ./data/agribalyse/agribalyse.csv
```

Both UI import and script import are acceptable, but script import is required as fallback.

---

# 12. Import script

Create:

`scripts/import-agribalyse.ts`

The script should accept:

```bash
npx tsx scripts/import-agribalyse.ts ./data/agribalyse/agribalyse.csv --version=3.2
```

The script should:

```txt
1. Read CSV/XLSX file
2. Detect columns
3. Print detected mapping
4. Require confirmation unless --yes is passed
5. Import rows
6. Print summary:
   - total rows
   - valid rows
   - invalid rows
   - imported rows
   - version
```

Optional flags:

```txt
--version=3.2
--replace
--yes
--dry-run
```

Do not commit dataset files.

---

# 13. Search service

Create:

`src/server/food/agribalyse-search.service.ts`

Implement:

```ts
searchAgribalyseFoodFactors()
getAgribalyseFoodFactorById()
listAgribalyseCategories()
```

## searchAgribalyseFoodFactors

Input:

```ts
{
  query?: string;
  category?: string;
  version?: string;
  limit?: number;
}
```

Search logic:

```txt
1. Search name, nameEn, nameFr.
2. Filter by category if provided.
3. Filter active factors only.
4. Return top 20 by default.
5. Include climateChangeKgCo2ePerKg.
```

For MVP, use Prisma `contains` search.

Later, add fuzzy matching.

---

# 14. Matching logic

Create:

`src/lib/agribalyse/matching.ts`

Purpose:

Match Open Food Facts products/categories to Agribalyse food factors.

Implement:

```ts
normalizeFoodName()
scoreFoodFactorMatch()
findBestAgribalyseMatch()
```

Matching strategy:

```txt
1. Exact FoodFactorMapping by Open Food Facts category tag
2. Exact mapping by app category
3. Search Agribalyse by product/category name
4. Fuzzy match normalized words
5. Return no match if score is too low
```

Do not auto-create high-confidence matches from weak fuzzy matching.

Confidence rules:

```txt
Exact saved mapping → HIGH
Exact category mapping → MEDIUM
Fuzzy name match → LOW
No match → no estimate
```

Minimum fuzzy score:

```txt
0.75
```

If score is below threshold, return:

```txt
NO_RELIABLE_MATCH
```

---

# 15. Estimate logic

Create:

`src/lib/agribalyse/estimate.ts`

Implement:

```ts
export function calculateAgribalyseCo2eKg(input: {
  quantityKg: number;
  climateChangeKgCo2ePerKg: number;
}) {
  return input.quantityKg * input.climateChangeKgCo2ePerKg;
}
```

Validation:

```txt
quantityKg must be positive
climateChangeKgCo2ePerKg must be positive or zero
quantityKg should be capped to prevent nonsense input
```

Recommended MVP cap:

```txt
quantityKg <= 1000
```

---

# 16. Estimate service

Create:

`src/server/food/agribalyse-estimate.service.ts`

Implement:

```ts
estimateFoodWithAgribalyse()
estimateOpenFoodFactsProductWithAgribalyse()
estimateManualFoodLogWithAgribalyse()
```

## estimateFoodWithAgribalyse

Input:

```ts
{
  factorId: string;
  quantityKg: number;
  userId?: string;
  createActivityLog?: boolean;
  sourceContext?: string;
}
```

Flow:

```txt
1. Validate quantityKg.
2. Fetch AgribalyseFoodFactor.
3. Calculate co2eKg = quantityKg × climateChangeKgCo2ePerKg.
4. Return estimate.
5. If createActivityLog is true, create ActivityLog.
```

## estimateOpenFoodFactsProductWithAgribalyse

Input:

```ts
{
  userId: string;
  barcode: string;
  quantityKg?: number;
  createActivityLog?: boolean;
}
```

Flow:

```txt
1. Fetch normalized Open Food Facts product from existing product service.
2. Determine quantity:
   - explicit quantityKg
   - parsed product quantity
   - mapping default quantity
   - ask user if missing
3. Find saved FoodFactorMapping by Open Food Facts category tag.
4. If mapping exists, use mapped AgribalyseFoodFactor.
5. If no mapping, try low-confidence search.
6. If no reliable match, return NO_RELIABLE_MATCH.
7. Calculate co2eKg.
8. Create ActivityLog if requested.
```

Do not create ActivityLog for failed or unavailable estimates.

---

# 17. API routes

Create these routes.

## GET `/api/food/agribalyse/search`

Query params:

```txt
q
category
version
limit
```

Response:

```json
{
  "results": [
    {
      "id": "...",
      "name": "Rice, cooked",
      "category": "Cereals",
      "climateChangeKgCo2ePerKg": 2.1,
      "version": "3.2"
    }
  ]
}
```

## POST `/api/food/agribalyse/estimate`

Request:

```json
{
  "factorId": "agribalyse_factor_id",
  "quantityKg": 0.25,
  "createActivityLog": true
}
```

Response:

```json
{
  "status": "ESTIMATED",
  "estimate": {
    "co2eKg": 0.525,
    "quantityKg": 0.25,
    "factor": {
      "name": "Rice, cooked",
      "climateChangeKgCo2ePerKg": 2.1
    },
    "provider": "AGRIBALYSE",
    "confidence": "HIGH"
  },
  "activity": {}
}
```

## POST `/api/food/agribalyse/mappings`

Create mapping between Open Food Facts category and Agribalyse factor.

Request:

```json
{
  "appCategory": "FOOD",
  "appActivityType": "rice",
  "openFoodFactsTag": "en:rice",
  "label": "Rice category mapping",
  "agribalyseFoodFactorId": "factor_id",
  "defaultQuantityKg": 0.25,
  "confidence": "MEDIUM",
  "isActive": true
}
```

## GET `/api/food/agribalyse/stats`

Return:

```json
{
  "totalFactors": 2500,
  "activeFactors": 2500,
  "versions": ["3.2"],
  "categories": []
}
```

---

# 18. Developer routes

Create developer-only routes.

## GET `/api/dev/agribalyse/config`

Return:

```json
{
  "enabled": true,
  "dataVersion": "3.2",
  "sourceName": "AGRIBALYSE",
  "totalFactors": 2500,
  "hasImportedData": true
}
```

## POST `/api/dev/agribalyse/import-preview`

Purpose:

Upload CSV/XLSX and preview detected columns.

Return:

```json
{
  "jobId": "...",
  "headers": [],
  "detectedMapping": {},
  "previewRows": [],
  "totalRows": 2500,
  "missingRequiredColumns": []
}
```

## POST `/api/dev/agribalyse/import-confirm`

Purpose:

Confirm column mapping and import.

Request:

```json
{
  "jobId": "...",
  "version": "3.2",
  "columnMapping": {
    "name": "Food name",
    "climateChangeKgCo2ePerKg": "Climate change kg CO2 eq/kg",
    "category": "Category"
  },
  "replaceExistingVersion": true
}
```

## POST `/api/dev/agribalyse/search`

Search imported factors.

## POST `/api/dev/agribalyse/estimate`

Test estimate.

Request:

```json
{
  "factorId": "factor_id",
  "quantityKg": 0.25
}
```

## GET/POST/PATCH/DELETE `/api/dev/agribalyse/mappings`

Manage mappings.

---

# 19. Developer playground

Create page:

```txt
/dev/agribalyse-playground
```

Block page if:

```txt
ENABLE_DEV_API_PLAYGROUND !== true
```

The playground should include tabs:

```txt
Config
Import Dataset
Search Factors
Estimate
Category Mappings
Open Food Facts Match Test
Stats
```

## Config tab

Show:

```txt
Agribalyse version
Source name
Total imported factors
Active factors
Last import date
```

## Import Dataset tab

Show:

```txt
Upload CSV/XLSX
Detected headers
Detected column mapping
Preview rows
Confirm import
Dry-run import
Replace existing version toggle
```

## Search Factors tab

Fields:

```txt
Search query
Category
Version
Limit
```

Show results:

```txt
Name
Category
Sub-category
kg CO₂e/kg
Version
Source
Actions: Test estimate, Create mapping
```

## Estimate tab

Fields:

```txt
Factor selector
Quantity in kg
Calculate
```

Show:

```txt
co2eKg
kg CO₂e per kg
factor name
confidence
source
```

## Category Mappings tab

Show table:

```txt
Open Food Facts tag
App category
Agribalyse factor
Default quantity
Confidence
Active
Actions
```

## Open Food Facts Match Test tab

Input:

```txt
Barcode
Quantity kg
```

Flow:

```txt
Fetch product using Open Food Facts
Show category tags
Try mapping to Agribalyse
Show estimate or missing mapping notice
```

---

# 20. User-facing UI

Create or update:

```txt
FoodEstimateForm
FoodFactorSearch
FoodCarbonEstimateCard
FoodMappingNotice
FoodActivityHistory
```

## FoodEstimateForm

Allow:

```txt
Manual food search
Quantity in grams/kg
Estimate carbon
```

Fields:

```txt
Food item
Quantity
Unit
Meal context
```

## FoodCarbonEstimateCard

Show:

```txt
Food name
Quantity
Estimated kg CO₂e
kg CO₂e per kg
Provider: Agribalyse
Confidence
Source version
```

## FoodMappingNotice

If missing mapping:

```txt
We found this food/product, but no reliable Agribalyse factor is mapped yet.
```

Do not show raw dataset row in normal UI.

---

# 21. Open Food Facts integration

Update product carbon service so Open Food Facts can use Agribalyse.

Flow:

```txt
Barcode scan
→ Open Food Facts normalized product
→ categoryTags
→ FoodFactorMapping
→ AgribalyseFoodFactor
→ quantityKg
→ co2eKg
→ ProductScan + ActivityLog
```

Provider priority for food:

```txt
1. Agribalyse exact mapping
2. Climatiq food mapping
3. Manual factor
4. No estimate
```

Do not use Eco-Score as kg CO₂e.

Eco-Score can be displayed as extra environmental context only.

---

# 22. ActivityLog integration

When an Agribalyse estimate succeeds and `createActivityLog` is true, create:

```ts
{
  userId,
  category: "FOOD",
  activityType: factor.name,
  weightValue: quantityKg,
  weightUnit: "kg",
  co2eKg,
  provider: "AGRIBALYSE",
  sourceEndpoint: "agribalyse_local_dataset",
  sourcePayload: {
    factorId,
    quantityKg,
    mappingId,
    barcode
  },
  sourceResponse: {
    factor,
    estimate
  },
  sourceFactorId: factor.id,
  sourceActivityId: factor.agribalyseId || factor.ciqualCode,
  confidence,
  calculationMethod: "food_lca_quantity_based"
}
```

---

# 23. Dashboard integration

Update dashboard to show:

```txt
Food emissions today
Food emissions this week
Top food categories
Recent food logs
Scanned products estimated with Agribalyse
Products missing Agribalyse mapping
```

Example activity:

```txt
Rice, cooked
250 g
0.52 kg CO₂e
Agribalyse
Today
```

---

# 24. Error handling

Handle:

```txt
dataset not imported
invalid file
unsupported file type
missing column mapping
invalid climate value
invalid quantity
factor not found
no mapping found
Open Food Facts product not found
low-confidence match
database import failure
duplicate rows
unauthenticated user
playground disabled
```

Normal user message:

```txt
Could not estimate this food item yet. Try selecting a closer food category or quantity.
```

Developer message:

```txt
No valid climate change kg CO₂e/kg column was mapped.
```

---

# 25. Data quality and trust rules

Agribalyse data is LCA-based and may carry uncertainty.

Implement user-facing source transparency:

```txt
Source: Agribalyse
Estimate type: category-based food LCA
Confidence: medium
```

Rules:

```txt
Do not claim exact product-specific footprint unless factor is exact.
Do not overstate precision.
Round display values to 2 decimals.
Store raw factor metadata for traceability.
Show "estimated" instead of "measured".
```

---

# 26. Security and privacy requirements

Strict requirements:

1. Only authenticated users can create food ActivityLogs.
2. Developer import playground requires authentication.
3. Developer import playground should be hidden unless enabled.
4. Do not expose raw import controls to normal users.
5. Do not store large uploaded datasets permanently unless intended.
6. Do not commit dataset files.
7. Do not create ActivityLogs for failed estimates.
8. Do not let users write logs for another user.
9. Validate all quantities.
10. Do not use AI to invent factors.

---

# 27. Testing requirements

After implementation, test:

## Test 1: Config

Open:

```txt
/dev/agribalyse-playground
```

Expected:

```txt
Shows version, import status, total factor count.
No crash if no dataset imported.
```

## Test 2: Import preview

Upload sample CSV.

Expected:

```txt
Headers detected.
Preview rows shown.
Column mapping suggested.
Missing required columns shown.
```

## Test 3: Import confirm

Confirm mapping.

Expected:

```txt
Rows imported.
Invalid rows skipped with error count.
AgribalyseFoodFactor rows created.
```

## Test 4: Search

Search:

```txt
rice
```

Expected:

```txt
Returns imported factors matching rice.
Shows kg CO₂e/kg.
```

## Test 5: Manual estimate

Input:

```json
{
  "factorId": "factor_id",
  "quantityKg": 0.25
}
```

Expected:

```txt
co2eKg = quantityKg × kgCO2ePerKg.
```

## Test 6: Mapping

Create mapping:

```txt
Open Food Facts tag: en:rice
Agribalyse factor: Rice, cooked
```

Expected:

```txt
Mapping saved.
Mapping can be tested.
```

## Test 7: Barcode to Agribalyse estimate

Scan product with mapped category.

Expected:

```txt
Open Food Facts product found.
Category mapping found.
Agribalyse estimate created.
ActivityLog saved.
Dashboard updates.
```

## Test 8: Missing mapping

Scan product without mapping.

Expected:

```txt
Returns missing mapping notice.
No ActivityLog created.
```

## Test 9: Invalid quantity

Use quantityKg = -1.

Expected:

```txt
Validation error.
No estimate.
No ActivityLog.
```

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

After implementation, provide:

1. Files created
2. Files modified
3. Prisma migration name
4. Environment variables added
5. How to download/place Agribalyse dataset
6. How to run the import script
7. How to use the developer playground
8. How to search food factors
9. How to create mappings
10. How to test manual food estimates
11. How Open Food Facts connects to Agribalyse
12. How ActivityLog is created
13. Known assumptions about dataset columns
14. Any columns that required manual mapping
15. Any remaining TODOs

---

# 30. Acceptance criteria

The implementation is complete only when:

* Agribalyse is implemented as a local dataset provider.
* Dataset import works through script or developer playground.
* Agribalyse rows are normalized and stored.
* Food factor search works.
* Manual food estimate works.
* Open Food Facts category-to-Agribalyse mapping works.
* Product barcode scan can use Agribalyse when mapping exists.
* Missing mappings return clear unavailable status.
* Successful food estimates create ActivityLog entries.
* Dashboard shows Agribalyse food activities.
* Developer playground exists at `/dev/agribalyse-playground`.
* Playground supports import, search, estimate, mappings, and match testing.
* Carbon values are calculated as quantityKg × kgCO₂e/kg.
* No fake values are generated.
* No dataset files are committed accidentally.
* TypeScript has no errors.
* Prisma migration runs successfully.
* Existing design, fonts, colors, and layout are preserved.
