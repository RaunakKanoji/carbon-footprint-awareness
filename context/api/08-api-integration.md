You are working inside my local Next.js App Router project for **Carbon Compass AI**.

The app has implemented most of the required APIs and most MVP features are complete. I now need you to perform a final **API polish + UI integration pass**.

This is not a redesign task. This is a functional integration task.

Do **not** commit or push anything unless I explicitly approve.

---

# Current API Stack

The app currently has these API/data integrations:

```txt
CarbonSutra
Climatiq
OpenRouteService
Open Food Facts
Agribalyse
Carbon Interface — implemented but currently broken/disabled
Internal Carbon Compass carbon engine
```

Carbon Interface is currently considered broken because its auth/account setup is not working reliably. Do not depend on Carbon Interface for MVP-critical flows.

---

# Main Goal

Make the app’s carbon tracking flows actually use the implemented APIs in a clean, reliable, user-facing way.

The app should not simply have API playgrounds. The APIs should power real user actions in the app.

The user should be able to:

* log transport using route/distance data
* log food using Open Food Facts and Agribalyse where possible
* log energy using CarbonSutra first, Climatiq second, internal engine last
* log shopping using Climatiq/category factors and internal fallback
* log waste using available API/factor fallback
* estimate products using metadata/category fallback
* see source/confidence labels in the UI
* understand when the app used a verified API vs estimated fallback
* get stable results even when external APIs fail

---

# Hard Rules

Do not change:

* app fonts
* font sizes
* colors
* card design
* global layout
* visual identity
* sidebar design
* page styling unless required for API UI integration

Do not add a new major API unless absolutely necessary.

Do not remove existing working APIs.

Do not depend on Carbon Interface for MVP-critical paths.

Do not expose API keys in the client.

Do not call external carbon APIs directly from client components.

All external API calls must go through server-side API routes or server actions.

Do not commit or push.

---

# API Priority Rules

Use this fallback priority across the carbon engine:

```txt
1. CarbonSutra — primary provider where supported
2. Climatiq — secondary provider / global fallback
3. Category-specific datasets:
   - OpenRouteService for distance/routing
   - Open Food Facts for product/food metadata
   - Agribalyse for food LCA factors
4. Internal Carbon Compass carbon engine — final fallback
5. Carbon Interface — disabled/optional until fixed
```

The internal carbon engine must be calibrated so that its outputs are reasonably close to external API outputs for the same inputs.

---

# Provider Responsibility Matrix

Use APIs based on the type of user action.

## Transport

Use:

```txt
OpenRouteService → distance calculation
CarbonSutra → primary emission estimate if supported
Climatiq → secondary emission estimate
Internal carbon engine → fallback
```

Transport flow:

```txt
User enters start/end route OR distance manually
↓
If route is available, OpenRouteService calculates distance
↓
CarbonSutra estimates emissions if category/unit supported
↓
If CarbonSutra fails, use Climatiq
↓
If Climatiq fails, use internal factor
↓
Save ActivityLog with provider metadata
```

Supported transport examples:

```txt
petrolCar
dieselCar
bus
metro
train
walking
bicycle
```

Walking and bicycle should be zero carbon and should not call paid/external carbon APIs unnecessarily.

## Food

Use:

```txt
Open Food Facts → barcode/product metadata
Agribalyse → food LCA factor where mapped
Climatiq → fallback food category factor
Internal carbon engine → final fallback
```

Food flow:

```txt
User logs meal manually OR scans/searches food/product
↓
Open Food Facts gets product/category/nutrition metadata if barcode/search is used
↓
Agribalyse maps product/category to LCA factor where possible
↓
Climatiq fallback for broad food category if needed
↓
Internal factor fallback if API/data mapping fails
```

Supported food examples:

```txt
vegetarianMeal
veganMeal
chickenMeal
beefMeal
rice
milk
packagedFood
```

## Energy

Use:

```txt
CarbonSutra → primary
Climatiq → secondary
Internal carbon engine → fallback
```

Energy flow:

```txt
User enters kWh and region/grid
↓
CarbonSutra estimates electricity emissions
↓
If CarbonSutra fails, Climatiq estimates using region/grid factor
↓
If Climatiq fails, internal engine uses regional electricity factor
```

Supported energy examples:

```txt
indiaGrid
electricityKwh
homeElectricity
```

## Shopping

Use:

```txt
Open Food Facts → only for food/packaged product metadata
Climatiq → product/category estimate if available
Internal carbon engine → category fallback
```

Shopping flow:

```txt
User enters product/category/quantity/price
↓
If barcode/product metadata exists, enrich product details
↓
If exact product carbon footprint exists, use it
↓
If not, classify product into category
↓
Use Climatiq/category factor where possible
↓
Use internal average category factor as fallback
```

Supported shopping examples:

```txt
clothingItem
electronicsItem
onlineOrder
headphones
phone
laptop
fastFashion
householdItem
```

If exact product factor is missing, show this user-facing message:

```txt
We could not find a verified product carbon footprint for this item. This estimate uses an average factor for the closest product category.
```

## Waste

Use:

```txt
Climatiq → if suitable waste factors exist
Internal carbon engine → fallback
```

Supported waste examples:

```txt
landfillWaste
recycling
composting
plasticWaste
paperWaste
foodWaste
```

Waste should never fail for default form options. If an external API does not support the category, the internal engine must handle it.

---

# Data Model / Metadata Requirements

When saving an activity estimate, store enough metadata to explain the estimate.

Inspect the existing Prisma schema first.

If fields already exist, reuse them.

If missing and safe to add, consider adding fields like:

```txt
provider
providerSource
providerConfidence
providerReferenceId
emissionFactorUsed
fallbackUsed
calculationMethod
rawInput
```

Do not make unnecessary schema changes if the MVP can use existing fields.

Recommended metadata values:

```txt
provider: "CARBONSUTRA" | "CLIMATIQ" | "OPENROUTESERVICE" | "OPENFOODFACTS" | "AGRIBALYSE" | "INTERNAL"
confidence: "HIGH" | "MEDIUM" | "LOW"
fallbackUsed: true | false
```

Example:

```json
{
  "provider": "CARBONSUTRA",
  "fallbackUsed": false,
  "confidence": "HIGH",
  "calculationMethod": "electricity_kwh_region_factor",
  "emissionFactorUsed": 0.82
}
```

---

# API Orchestration Architecture

Create or refine a centralized carbon estimation service.

Search existing files:

```bash
grep -R "estimateCarbon\|carbon engine\|EmissionFactor\|CarbonSutra\|Climatiq\|OpenRouteService\|Agribalyse\|OpenFoodFacts" -n app lib components
```

Preferred structure:

```txt
lib/carbon/
  estimate.ts
  providers/
    carbonsutra.ts
    climatiq.ts
    openrouteservice.ts
    openfoodfacts.ts
    agribalyse.ts
    internal-engine.ts
  mapping/
    activity-mapping.ts
    product-category-mapping.ts
    food-mapping.ts
  types.ts
```

If the project already has a structure, do not rewrite everything. Improve existing structure.

The central service should expose something like:

```ts
estimateActivityCarbon(input)
```

and internally choose the correct provider/fallback chain.

---

# Expected Estimate Response Shape

Standardize the output of all estimate routes.

Use a response like:

```ts
type CarbonEstimateResult = {
  co2eKg: number;
  unit: string;
  quantity: number;
  category: string;
  subType: string;
  provider: "CARBONSUTRA" | "CLIMATIQ" | "AGRIBALYSE" | "OPENFOODFACTS" | "INTERNAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  fallbackUsed: boolean;
  method: string;
  explanation: string;
  sourceLabel: string;
};
```

Example user-facing result:

```json
{
  "co2eKg": 4.5,
  "unit": "kg",
  "quantity": 10,
  "category": "WASTE",
  "subType": "landfillWaste",
  "provider": "INTERNAL",
  "confidence": "MEDIUM",
  "fallbackUsed": true,
  "method": "waste_weight_factor",
  "explanation": "Estimated using Carbon Compass fallback factor for landfill waste.",
  "sourceLabel": "Carbon Compass estimate"
}
```

---

# API Fallback Logic

Implement graceful fallback.

Pseudo-code:

```ts
async function estimateWithFallback(input) {
  const providers = getProvidersForCategory(input.category);

  for (const provider of providers) {
    try {
      const result = await provider.estimate(input);

      if (result && result.co2eKg >= 0) {
        return {
          ...result,
          fallbackUsed: provider.name !== providers[0].name,
        };
      }
    } catch (error) {
      logger.warn("Carbon provider failed", {
        provider: provider.name,
        category: input.category,
        subType: input.subType,
        error,
      });
    }
  }

  return internalEngine.estimate(input);
}
```

Rules:

* External API failure should not break activity logging.
* If primary fails, automatically try secondary.
* If all external providers fail, use internal engine.
* Show provider/fallback info to user.
* Log provider failures server-side.
* Do not expose raw API error details to users.

---

# Internal Carbon Engine Calibration

The internal carbon engine should produce estimates reasonably close to API outputs.

Audit existing internal factors.

Check factors for:

```txt
petrolCar
dieselCar
bus
metro
train
vegetarianMeal
veganMeal
chickenMeal
beefMeal
indiaGrid
clothingItem
landfillWaste
recycling
composting
```

Create or update calibration notes in:

```txt
docs/carbon-engine-calibration.md
```

or similar.

The document should explain:

```txt
- factor name
- unit
- value
- source/provider it approximates
- confidence
- category
```

Do not invent fake precision. Generalized factors are acceptable for MVP if clearly labeled.

Internal engine should use:

```txt
co2eKg = quantity × factor
```

with normalization for passenger count, serving count, route distance, or unit conversions where needed.

---

# UI Integration Requirements

The UI should clearly show that APIs are powering the app, but without clutter.

## Log Activity Page

For each category form:

```txt
Transport
Food
Energy
Shopping
Waste
```

Show:

* live estimate
* provider/source label
* confidence label
* fallback note if applicable

Example:

```txt
Live Estimate
4.5 kg CO₂e
Source: CarbonSutra · High confidence
```

If fallback used:

```txt
Source: Carbon Compass estimate · Medium confidence
External provider unavailable, using fallback factor.
```

Do not redesign the card. Add small, clean source text only.

## Activity Success Message

After successful logging, message should include source:

```txt
Successfully recorded activity: 4.5 kg CO₂e · Source: Carbon Compass estimate
```

Buttons should hide while message is visible if that behavior already exists.

## Dashboard Recent Activities

Add small source/fallback indicator only if it fits cleanly.

Example:

```txt
Petrol Car
CarbonSutra estimate
```

or:

```txt
Petrol Car
Fallback estimate
```

Do not make the table crowded.

## Product / Shopping UI

When exact product data is missing, show a user-friendly fallback notice:

```txt
Exact product footprint unavailable. We estimated this using the closest product category.
```

Show:

```txt
Product metadata: Open Food Facts
Carbon estimate: Climatiq / Carbon Compass fallback
```

## Insights UI

Where possible, show source coverage:

```txt
72% API-estimated
28% fallback-estimated
```

Optional for MVP. Do not overbuild.

---

# API Route Integration

Inspect existing routes:

```txt
app/api/activity
app/api/carbon
app/api/products
app/api/food
app/api/location
app/api/dev
```

Ensure production user flows use real integration routes, not only `/api/dev/*`.

MVP user-facing routes should not rely on dev playground endpoints.

Expected user-facing endpoints may include:

```txt
POST /api/activity
POST /api/carbon/estimate
POST /api/carbon/estimate-route
POST /api/products/estimate-carbon
GET /api/products/barcode/[barcode]
GET /api/food/agribalyse/search
POST /api/location/route-distance
```

If route names differ, use existing project routes.

---

# Provider Health and Failure UI

Add or refine a server-side provider health utility if already present.

Do not show scary technical API failures to users.

User-facing message:

```txt
We could not reach the primary provider, so we used a Carbon Compass fallback estimate.
```

Developer logs should include provider failure details.

Use existing logger.

---

# API Tests / Verification

Run existing API health check:

```bash
npm run check:apis
```

If the script does not exist, inspect package scripts.

Also test user-facing routes:

```bash
curl -i -X POST http://localhost:3000/api/carbon/estimate \
  -H "Content-Type: application/json" \
  -d '{"category":"ENERGY","subType":"indiaGrid","quantity":180,"unit":"kWh"}'

curl -i -X POST http://localhost:3000/api/carbon/estimate \
  -H "Content-Type: application/json" \
  -d '{"category":"TRANSPORT","subType":"petrolCar","quantity":10,"unit":"km"}'

curl -i -X POST http://localhost:3000/api/carbon/estimate \
  -H "Content-Type: application/json" \
  -d '{"category":"WASTE","subType":"landfillWaste","quantity":10,"unit":"kg"}'

curl -i -X POST http://localhost:3000/api/products/estimate-carbon \
  -H "Content-Type: application/json" \
  -d '{"name":"Sony XM6 headphones","category":"headphones","quantity":1}'
```

Adjust routes/payloads to match the actual project.

Expected:

* no 500 errors
* standardized error shape if invalid
* fallback result if external provider fails
* provider metadata included
* user-safe messages

---

# Manual UI Test Plan

Test these flows manually:

## Transport

```txt
Log petrol car, 10 km, 1 passenger.
```

Expected:

* route/distance works if using route input
* estimate appears
* provider source appears
* activity saves
* recent activity appears on dashboard

## Energy

```txt
Log 180 kWh India grid electricity.
```

Expected:

* CarbonSutra used first if available
* Climatiq fallback if needed
* internal fallback if both fail
* source displayed

## Food

```txt
Log vegetarian meal and beef meal.
```

Expected:

* Agribalyse/Open Food Facts used where relevant
* fallback works
* reasonable estimates
* source label visible

## Shopping

```txt
Estimate headphones or clothing item.
```

Expected:

* if exact PCF unavailable, category fallback is used
* app explains fallback
* no crash

## Waste

```txt
Log 10 kg landfill waste.
```

Expected:

* saves successfully
* no missing factor error
* estimate source shown

---

# API Coverage Decision

Do not add another major API for MVP unless there is a clear gap.

Current decision:

```txt
No additional API is required for MVP.
```

Optional future APIs can be documented but not implemented now:

```txt
Google Maps Places / Distance Matrix — optional replacement/enrichment for route UX
Amazon/Product Advertising API — optional product metadata, not carbon data
GS1 / barcode databases — optional product metadata
Ecoinvent / licensed LCA datasets — future advanced PCF accuracy
Electricity Maps / WattTime — future real-time grid emissions
```

For now, focus on polishing current integrations.

---

# Documentation Updates

Create or update:

```txt
docs/api-integration.md
docs/carbon-engine-calibration.md
```

`docs/api-integration.md` should explain:

```txt
- implemented APIs
- what each API does
- provider fallback order
- which user flows use which provider
- broken/disabled Carbon Interface status
- MVP limitations
```

`docs/carbon-engine-calibration.md` should explain:

```txt
- internal factor table
- units
- approximation notes
- fallback confidence
- how to improve later
```

Do not over-document fake claims.

---

# Final Quality Checks

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Also run:

```bash
npm run check:apis
```

if available.

Then run:

```bash
git status
git diff --name-only
git diff
```

Confirm:

* no random font changes
* no random color changes
* no broad redesign
* API integration changes are focused
* UI changes only add source/confidence/fallback info

---

# Final Report

Return:

```md
# API Polish and UI Integration Report

## Status
Completed / Partially Completed / Failed

## API Coverage Decision
State whether new APIs were added or not.

## Provider Priority Implemented
- CarbonSutra:
- Climatiq:
- OpenRouteService:
- Open Food Facts:
- Agribalyse:
- Internal Carbon Engine:
- Carbon Interface:

## User Flows Integrated
- Transport:
- Food:
- Energy:
- Shopping:
- Waste:
- Product estimate:
- Route estimate:

## Fallback Behavior
Explain how fallback works and where it is shown.

## Internal Engine Calibration
Explain what factors were calibrated and where documented.

## UI Integration
Explain where source/confidence/fallback labels were added.

## Files Changed
List files.

## Docs Added/Updated
- docs/api-integration.md:
- docs/carbon-engine-calibration.md:

## Verification
- npx tsc --noEmit:
- npm run lint:
- npm run build:
- npm run check:apis:

## Manual Tests
List tested flows and results.

## Remaining Issues
Mention Carbon Interface is still disabled/broken if still true.

## Commit Recommendation
Say whether this is safe for MVP commit.
```

Do not commit or push.
