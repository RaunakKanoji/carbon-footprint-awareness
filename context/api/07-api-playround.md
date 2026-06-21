You are a senior product designer, frontend engineer, developer-experience designer, and technical UI architect working on my carbon footprint tracker app called **Carbon Compass AI**.

The app already has or is planned to have developer playgrounds for these APIs/datasets:

1. CarbonSutra
2. Carbon Interface
3. Climatiq
4. OpenRouteService
5. Open Food Facts
6. Agribalyse
7. Electricity Maps, optional/future
8. OpenAI, optional/future

Your task is to **redesign and improve the UI/UX of all developer API playgrounds** so that each API is easier to understand, test, debug, compare, and connect to the main carbon tracking flow.

This is not a normal user-facing redesign.
This is a **developer/admin playground redesign**.

Do not change the main app design randomly.
Do not change the existing brand colors, fonts, dashboard layout, or unrelated pages.
Do not break existing API routes.
Do not expose API keys or secrets.
Do not remove any existing test functionality.
Do not make the UI childish.
Do not over-animate.
Do not hide technical details that developers need.

The goal is to make each playground feel like a clean internal developer console where I can understand:

* what the API does
* what input it expects
* what endpoint is being tested
* what payload is being sent
* what response is returned
* what normalized value the app extracts
* whether the result came from cache
* how this API connects to Carbon Compass AI

---

# 1. Main objective

Improve all playgrounds into a consistent **API Testing & Understanding Console**.

Each playground should help me answer:

```txt
What is this API used for?
Which app features depend on it?
What endpoint am I testing?
What inputs are required?
What sample payload should I use?
What normalized output does my app store?
Did the API call succeed or fail?
Was the result cached?
What should I do next with this result?
```

---

# 2. Playground pages to improve

Improve these existing or planned pages:

```txt
/dev/carbonsutra-playground
/dev/carbon-interface-playground
/dev/climatiq-playground
/dev/openrouteservice-playground
/dev/open-food-facts-playground
/dev/agribalyse-playground
```

If some pages use different paths, preserve the existing paths and apply the same design system.

Optional future pages:

```txt
/dev/electricity-maps-playground
/dev/openai-playground
```

Do not create future pages unless the related implementation already exists. But design the layout system so they can be added later.

---

# 3. Global playground design system

Create a reusable playground layout system.

Suggested components:

```txt
ApiPlaygroundShell
ApiPlaygroundHeader
ApiStatusCard
ApiPurposeCard
ApiEndpointTabs
ApiEndpointCard
ApiInputForm
ApiPayloadEditor
ApiSamplePayloadSelector
ApiResponsePanel
ApiNormalizedOutputCard
ApiCacheStatusBadge
ApiErrorPanel
ApiDocsHintCard
ApiAppFlowCard
ApiTestHistoryPanel
JsonViewer
CopyButton
ResetButton
RunTestButton
```

Use existing shadcn-style components where possible.

The UI should feel like:

```txt
Linear
Vercel dashboard
Stripe docs
Postman-lite
OpenAI playground
Modern internal admin console
```

Do not make it look like a toy, game, or public marketing page.

---

# 4. Global layout structure

Every playground page should follow this structure:

```txt
Page Header
→ API purpose summary
→ Configuration status
→ App integration flow
→ Endpoint/test tabs
→ Input form + raw payload editor
→ Run test action
→ Normalized result
→ Raw response
→ Error/debug panel
→ Recent test history
```

Use a two-column layout on desktop:

```txt
Left column:
- API purpose
- endpoint selector
- input form
- sample payloads
- run button

Right column:
- config status
- normalized output
- raw response
- errors
- cache status
```

On mobile/tablet, stack sections vertically.

---

# 5. Playground header

Each playground should have a clear header.

Example:

```txt
CarbonSutra Playground
Test lifestyle carbon APIs for commute, electricity, flights, fuel, hotels, freight, and eCommerce shipments.
```

Header should include:

```txt
API name
Short description
Provider type
Best use cases
Status badge: Configured / Missing config / Disabled
```

Provider types:

```txt
CarbonSutra → Carbon calculation provider
Carbon Interface → Carbon calculation fallback/provider
Climatiq → Emission factor and advanced estimate provider
OpenRouteService → Distance, geocoding, and routing provider
Open Food Facts → Barcode and product metadata provider
Agribalyse → Local food LCA dataset provider
Electricity Maps → Live grid carbon intensity provider
OpenAI → AI insight and parsing provider
```

---

# 6. API purpose card

Every playground needs a clear **What this API is for** card.

Example for CarbonSutra:

```txt
Use CarbonSutra for:
- commute emissions
- vehicle by type
- vehicle by model
- India electricity
- flights
- hotel stays
- fuel use
- eCommerce delivery
- freight/shipping
```

Example for OpenRouteService:

```txt
Use OpenRouteService for:
- route distance
- route duration
- geocoding addresses
- comparing car/bike/walk routes
- calculating distance before carbon estimation
```

Example for Open Food Facts:

```txt
Use Open Food Facts for:
- barcode lookup
- product name
- brand
- category tags
- quantity
- ingredients
- packaging
- Eco-Score/Nutri-Score metadata
```

Also show a warning when relevant:

```txt
This API does not calculate final carbon emissions by itself.
```

For example:

```txt
Open Food Facts identifies products. Carbon estimates come from Climatiq, Agribalyse, or manual factors.
```

---

# 7. Configuration status card

Each playground should show a configuration card.

The card should show:

```txt
API enabled
Base URL configured
API key configured, if required
User-Agent configured, if required
Dataset imported, if required
Required endpoint paths configured, if required
Playground enabled
```

Do not show actual secret values.

Use labels:

```txt
Configured
Missing
Optional
Disabled
Not required
```

Examples:

## CarbonSutra config

```txt
API key: Configured
RapidAPI host: Configured
Base URL: Configured
Vehicle endpoint: Configured
Electricity endpoint: Configured
Flight endpoint: Missing
Playground: Enabled
```

## Open Food Facts config

```txt
API key: Not required
Base URL: Configured
User-Agent: Configured
Product lookup endpoint: Available
Search endpoint: Available
Playground: Enabled
```

## Agribalyse config

```txt
API key: Not required
Dataset version: 3.2
Imported factors: 2,500
Lifecycle rows: 0
Ingredient rows: 0
Playground: Enabled
```

---

# 8. App integration flow card

Every playground should show a small flow diagram or step list showing how the API fits into Carbon Compass.

Examples:

## OpenRouteService

```txt
User enters origin/destination
→ OpenRouteService calculates distance
→ CarbonSutra/Climatiq calculates CO₂e
→ ActivityLog saves route-based emission
→ Dashboard updates
```

## Open Food Facts

```txt
User scans barcode
→ Open Food Facts identifies product
→ App maps category to Agribalyse/Climatiq factor
→ Carbon estimate is calculated
→ ProductScan and ActivityLog are saved
```

## Climatiq

```txt
Developer searches emission factors
→ saves mapping
→ user logs activity
→ app builds estimate payload
→ Climatiq returns co2e
→ ActivityLog stores normalized co2eKg
```

This section is very important because the playground should teach how the API connects to the app.

---

# 9. Endpoint tabs

Each playground should use clear endpoint tabs.

## CarbonSutra tabs

```txt
Vehicle by Type
Vehicle by Model
Electricity
Flight
Fuel
Hotel Stay
Freight
eCommerce Shipment
```

## Carbon Interface tabs

```txt
Vehicle Estimate
Electricity Estimate
Flight Estimate
Shipping Estimate
Fuel Combustion
Vehicle Makes
Vehicle Models
Auth Test
```

## Climatiq tabs

```txt
Search Factors
Estimate
Batch Estimate
Saved Mappings
Mapping Test
```

## OpenRouteService tabs

```txt
Geocode
Reverse Geocode
Directions
Matrix
Compare Routes
Google Maps Link Import
Route to Carbon
```

## Open Food Facts tabs

```txt
Barcode Lookup
Product Search
Category Tags
Carbon Mapping Test
Recent Scans
```

## Agribalyse tabs

```txt
Config
Import Dataset
Search Factors
Estimate
Lifecycle Breakdown
Ingredient Breakdown
Category Mappings
Open Food Facts Match Test
Stats
```

---

# 10. Endpoint explanation panel

Each endpoint tab should show a short explanation before the form.

For every endpoint, include:

```txt
What this call does
When the app uses it
Required inputs
Optional inputs
Normalized output
Common errors
```

Example:

```txt
Vehicle by Type

Use this when the user knows the vehicle type but not the exact model.

Required:
- vehicle type
- distance
- distance unit

Optional:
- fuel type
- include WTT

Normalized output:
- co2eKg
- provider
- source endpoint
- raw response
```

---

# 11. Input mode: form + raw JSON

Every endpoint should support two input modes:

```txt
Guided Form
Raw JSON
```

Guided Form:

* beginner-friendly
* clear field labels
* validation
* dropdowns for known options
* helper text

Raw JSON:

* developer-friendly
* editable JSON payload
* copy/paste from docs
* format JSON button
* validate JSON button

Both modes should stay in sync if possible.

If sync is too complex, allow switching with confirmation.

---

# 12. Sample payload selector

Each endpoint should have sample payloads.

Examples:

```txt
Mumbai commute by petrol car
India electricity 180 kWh
BOM to DEL economy round trip
Oat milk barcode lookup
Andheri to BKC route
Steel weight estimate
Rice Agribalyse estimate
```

UI:

```txt
Sample payload dropdown
Load sample
Reset
Copy sample
```

For each sample, show:

```txt
Sample name
Purpose
Expected output type
```

Example:

```txt
Sample: India electricity bill
Purpose: Estimate monthly grid electricity emissions
Expected output: kg CO₂e
```

---

# 13. Run button states

The Run button should be very clear.

States:

```txt
Run Test
Running...
Success
Failed
Using Cache
Disabled: Missing Config
```

If config is missing, the run button should be disabled and show:

```txt
Missing API key or endpoint path. Check environment variables.
```

For Agribalyse:

```txt
Dataset has not been imported yet.
```

For Open Food Facts:

```txt
Missing User-Agent.
```

---

# 14. Normalized output card

Every playground should have a **Normalized Output** card.

This is the most important developer clarity feature.

Show what the app extracted from the raw API response.

Examples:

## Carbon APIs

```txt
co2eKg: 3.42
provider: CARBONSUTRA
category: TRANSPORT
calculationMethod: vehicle_by_type_distance_based
fromCache: false
```

## OpenRouteService

```txt
distanceKm: 16.4
durationMinutes: 40
profile: driving-car
fromCache: true
```

## Open Food Facts

```txt
barcode: 3017624010701
productName: Nutella
brand: Ferrero
categoryTags: [...]
ecoScore: d
carbonEstimateStatus: NO_CATEGORY_MAPPING
```

## Agribalyse

```txt
foodName: Rice, cooked
quantityKg: 0.25
kgCO2ePerKg: 2.1
co2eKg: 0.525
provider: AGRIBALYSE
```

Always show normalized output above raw response.

---

# 15. Raw response viewer

Every playground should include a raw response viewer.

Requirements:

```txt
Collapsible by default
Pretty-printed JSON
Copy JSON button
Expand/collapse all
Search within JSON if easy
Show response size if easy
```

Do not show raw API responses in normal user pages.

Only show raw JSON in developer playgrounds.

---

# 16. Error panel

Errors should be clear and actionable.

Show:

```txt
Error title
HTTP status, if available
Provider
Endpoint
Human-readable message
Possible fix
Raw error response
```

Example:

```txt
CarbonSutra request failed with status 400

Possible fixes:
- Check endpoint path in .env.local
- Check required payload fields
- Verify RapidAPI subscription
- Confirm the API key is valid
```

Example for Climatiq:

```txt
No emission factor found

Possible fixes:
- Search for the factor in Search Factors tab
- Check region
- Check unit_type
- Check data_version
```

Example for Agribalyse:

```txt
No dataset imported

Possible fixes:
- Go to Import Dataset tab
- Upload Synthèse des résultats CSV
- Confirm column mapping
```

---

# 17. Cache status

Every playground should show cache information.

Show:

```txt
fromCache: true/false
cacheKey short hash
cachedAt, if available
expiresAt, if available
Clear cache for this payload button, optional
```

Do not make cache invisible. It is important for understanding why an API was or was not called.

---

# 18. Test history panel

Add a lightweight recent test history panel.

For each test:

```txt
timestamp
provider
endpoint
status
normalized result
fromCache
```

Example:

```txt
12:42 PM · CarbonSutra · Electricity · Success · 128.4 kg CO₂e · Cache: No
```

This can be stored in local component state for MVP.

No need for database persistence unless already implemented.

---

# 19. Provider comparison panel

Create one optional global page:

```txt
/dev/api-playgrounds
```

This page should list all API playgrounds and show status.

Cards:

```txt
CarbonSutra
Carbon Interface
Climatiq
OpenRouteService
Open Food Facts
Agribalyse
```

Each card should show:

```txt
Configured / Missing
Primary purpose
Best use cases
Open playground button
Last tested status, if available
```

Also include a routing guide table:

```txt
Task → Recommended API
Commute distance → OpenRouteService
Commute carbon → CarbonSutra
India electricity → CarbonSutra / Climatiq
US electricity → Carbon Interface / Climatiq
Food barcode → Open Food Facts
Food carbon → Agribalyse / Climatiq
Product/material → Climatiq
Receipt/batch → Climatiq batch
```

---

# 20. API-specific UI requirements

## CarbonSutra playground

Make the UI explain that CarbonSutra is best for lifestyle calculations.

Important UI sections:

```txt
Lifestyle carbon endpoints
India-friendly electricity
Vehicle by type vs vehicle by model
Flight options: RF, WTT, round trip
eCommerce shipment vs freight
```

For each endpoint, show required fields.

Show normalized:

```txt
co2eKg
provider
endpoint
activity category
fromCache
```

Add helper text:

```txt
Use this for most MVP lifestyle calculations.
```

---

## Carbon Interface playground

Make the UI explain that Carbon Interface is a clean fallback/simple estimate provider.

Important UI sections:

```txt
Vehicle makes lookup
Vehicle models lookup
Vehicle estimate with vehicle_model_id
Electricity region limitations
Shipping estimate
Fuel combustion estimate
```

Add a clear note:

```txt
Vehicle estimates require a vehicle_model_id. Use Vehicle Makes and Vehicle Models tabs first.
```

For electricity, add:

```txt
Carbon Interface is strongest for supported country/state regions. Use CarbonSutra or Climatiq for India-focused electricity if needed.
```

---

## Climatiq playground

Make the UI explain that Climatiq is emission-factor based.

Important UI sections:

```txt
Search first
Select factor
Save mapping
Estimate
Batch estimate
Use saved mapping in app
```

The UI should strongly guide this flow:

```txt
1. Search emission factors
2. Inspect activity_id, region, unit_type, source, year
3. Save selected factor as mapping
4. Test estimate
5. Use mapping in user-facing form
```

For Search results, show columns:

```txt
Name
Activity ID
Factor ID
Region
Year
Unit type
Source
Dataset
Category
Sector
Data quality flags
Actions
```

Actions:

```txt
Copy activity_id
Use in Estimate
Save as Mapping
```

Add warning:

```txt
Do not use placeholder activity IDs in production estimates.
```

---

## OpenRouteService playground

Make the UI explain that OpenRouteService calculates distance, not carbon.

Important UI sections:

```txt
Geocode
Reverse geocode
Directions
Matrix
Compare routes
Google Maps link import
Route to carbon
```

Show coordinate format clearly:

```txt
App input: { lat, lng }
OpenRouteService payload: [lng, lat]
```

For Directions, show:

```txt
distanceKm
durationMinutes
profile
```

For Route to Carbon, show:

```txt
distance calculated by OpenRouteService
carbon calculated by selected carbon provider
ActivityLog created
```

Add note:

```txt
Walking and cycling have 0 direct CO₂e, but may still have lifecycle impacts not included here.
```

---

## Open Food Facts playground

Make the UI explain that Open Food Facts identifies products but does not provide final carbon footprints.

Important UI sections:

```txt
Barcode lookup
Product search
Category tags
Eco-Score/Nutri-Score/NOVA metadata
Carbon mapping test
Recent scans
```

Show normalized product card:

```txt
Product image
Product name
Brand
Barcode
Quantity
Category tags
Packaging tags
Eco-Score
Nutri-Score
NOVA
```

Add warning:

```txt
Eco-Score is not the same as kg CO₂e.
```

Show carbon mapping status:

```txt
Mapped to Agribalyse
Mapped to Climatiq
Manual factor
No mapping found
```

---

## Agribalyse playground

Make the UI explain that Agribalyse is a local dataset, not a normal API.

Important UI sections:

```txt
Dataset import status
Synthèse des résultats
Lifecycle stage detail
Ingredient detail
Search factors
Estimate
Category mappings
Open Food Facts match test
```

Show import progress clearly:

```txt
No dataset imported
Summary dataset imported
Lifecycle detail imported
Ingredient detail imported
```

Show the role of each file:

```txt
Synthèse = main estimate
Lifecycle detail = breakdown/explanation
Ingredient detail = ingredient contribution/explanation
```

For estimates, show:

```txt
quantityKg
kgCO2ePerKg
co2eKg
factor name
version
confidence
```

Add warning:

```txt
Agribalyse estimates are category-based LCA estimates, not exact product-specific measurements.
```

---

# 21. Better educational copy

Add short help text to make the playground self-explanatory.

Use concise copy.

Examples:

```txt
This endpoint estimates emissions when you already know the distance.
```

```txt
Use this search to find a Climatiq activity ID before creating a mapping.
```

```txt
Open Food Facts gives product metadata. Use Agribalyse or Climatiq for carbon estimates.
```

```txt
OpenRouteService returns distance. The app sends this distance to CarbonSutra or Climatiq to calculate CO₂e.
```

```txt
Agribalyse values are usually kg CO₂e per kg of food product.
```

---

# 22. Empty states

Every playground should have good empty states.

Examples:

## Missing config

```txt
This provider is not configured yet.
Add the required environment variables, restart the dev server, and try again.
```

## No response yet

```txt
Run a test to see the normalized output and raw API response.
```

## No mappings

```txt
No mappings saved yet.
Search for a factor or dataset row, then save it as a mapping.
```

## No Agribalyse dataset

```txt
No Agribalyse dataset imported.
Import “Synthèse des résultats” first to enable food estimates.
```

## No product found

```txt
Open Food Facts did not find this barcode.
Try manual search or check the barcode.
```

---

# 23. Visual hierarchy

Use this hierarchy:

```txt
Most important:
- API purpose
- current endpoint
- input form
- normalized output
- error state

Secondary:
- raw JSON
- cache status
- request details

Tertiary:
- docs hints
- recent test history
```

Do not make raw JSON the first thing users see.
Show normalized result first.

---

# 24. Better form design

Forms should use:

```txt
clear labels
helper text
placeholder examples
dropdowns for enum values
unit selectors
validation messages
disabled states
sample loaders
```

Examples:

```txt
Distance
[ 12 ] [km]

Fuel type
[Petrol ▼]

Airport code
[BOM]
Helper: Use 3-letter IATA code.
```

Avoid showing raw API field names in guided forms unless it is a developer-only advanced section.

For example, show:

```txt
Fuel type
```

not:

```txt
FUEL_TYPE
```

But raw JSON mode can show the real API field names.

---

# 25. Request preview

Every endpoint should show a request preview before running.

Request preview should include:

```txt
Internal app route being called
External provider endpoint
Method
Payload
```

Do not include secrets.

Example:

```txt
Internal route:
POST /api/dev/carbonsutra/test

External provider:
CarbonSutra vehicleType

Payload:
{ ... }
```

For Carbon Interface:

```txt
Authorization header: Bearer ••••••••
```

Do not show actual key.

---

# 26. Connection to ActivityLog

For endpoints that can create ActivityLog entries, show a clear toggle:

```txt
Create ActivityLog
[ off by default in developer playground ]
```

Default should be OFF for playgrounds.

If enabled, show:

```txt
This will create a real activity for the current authenticated user.
```

After creation, show:

```txt
ActivityLog created
Activity ID: ...
Dashboard should now include this result.
```

Do not create ActivityLog silently from playground tests.

---

# 27. Consistent badges

Create or reuse badges for:

```txt
Configured
Missing
Success
Failed
Cached
Live API
Normalized
Raw
Estimate
Metadata only
Dataset
No key required
Carbon provider
Support provider
```

Examples:

```txt
Open Food Facts → Metadata only
Agribalyse → Dataset
CarbonSutra → Carbon provider
OpenRouteService → Support provider
```

---

# 28. Accessibility and responsiveness

Requirements:

```txt
Keyboard accessible tabs
Readable contrast
Clear focus states
Responsive layout
No horizontal overflow on mobile
Forms usable on smaller screens
JSON viewer scrolls safely
Buttons have accessible labels
Error messages are readable
```

---

# 29. Security requirements

Strict requirements:

1. Never show actual API keys.
2. Never show full authorization headers.
3. Never expose `.env` values.
4. Playground pages should be disabled when `ENABLE_DEV_API_PLAYGROUND !== true`.
5. Require Clerk authentication.
6. Prefer admin/owner-only access if the app has roles.
7. Developer routes must not be accessible from normal users if roles exist.
8. Do not log secrets.
9. Raw payloads may be shown; secrets must be redacted.
10. ActivityLog creation must be explicit, not automatic.

---

# 30. Suggested route/page index

Add a central API playground index page if it does not exist:

```txt
/dev/api-playgrounds
```

Page title:

```txt
API Playgrounds
Understand, test, and debug Carbon Compass integrations.
```

Cards:

```txt
CarbonSutra
Carbon Interface
Climatiq
OpenRouteService
Open Food Facts
Agribalyse
```

Each card:

```txt
Purpose
Status
Primary app feature
Open button
```

Example:

```txt
OpenRouteService
Routing & distance provider
Used for commute distance before carbon estimation
Status: Configured
[Open Playground]
```

---

# 31. Implementation sequence

Follow this order:

```txt
1. Audit existing playground pages and components.
2. Create shared playground layout components.
3. Create shared JSON viewer, response panel, status cards, and sample payload selector.
4. Improve CarbonSutra playground.
5. Improve Carbon Interface playground.
6. Improve Climatiq playground.
7. Improve OpenRouteService playground.
8. Improve Open Food Facts playground.
9. Improve Agribalyse playground.
10. Add central /dev/api-playgrounds index.
11. Test all playgrounds.
12. Verify no secrets are exposed.
```

---

# 32. Testing checklist

Test each playground:

```txt
Page loads when enabled
Page is blocked when disabled
Config status works
Missing config states are clear
Sample payload loads
Guided form works
Raw JSON mode works
Run test works
Success state is clear
Error state is clear
Normalized output appears
Raw response appears
Cache status appears
Copy response works
Reset/clear works
No API secrets shown
Mobile layout works
```

Specific tests:

## CarbonSutra

```txt
Vehicle by type sample
Electricity India sample
Flight sample
Missing endpoint path state
```

## Carbon Interface

```txt
Vehicle makes
Vehicle models
Vehicle estimate
Electricity sample
Invalid model ID error
```

## Climatiq

```txt
Search factors
Use search result in estimate
Save mapping
Batch estimate
Missing mapping warning
```

## OpenRouteService

```txt
Geocode
Directions
Compare routes
Google Maps link import
Route to carbon
```

## Open Food Facts

```txt
Barcode lookup
Product not found
Product search
Carbon mapping test
Eco-Score warning visible
```

## Agribalyse

```txt
Dataset not imported state
Search factors
Manual estimate
Lifecycle breakdown if imported
Ingredient breakdown if imported
Open Food Facts match test
```

---

# 33. Build and quality checks

Run:

```bash
npm run lint
npm run typecheck
npm run build
npx prisma format
npx prisma generate
```

If the project does not have `typecheck`, use the equivalent TypeScript command.

Fix all TypeScript errors.
Fix all lint errors caused by this implementation.
Do not ignore errors.

---

# 34. Final output required from coding agent

After implementation, provide:

1. Files created
2. Files modified
3. Shared playground components created
4. Playground pages improved
5. New `/dev/api-playgrounds` index page, if created
6. Screens/pages tested
7. Any APIs that still need backend fixes
8. Any UI states that could not be tested
9. Confirmation that no secrets are exposed
10. Remaining TODOs

---

# 35. Acceptance criteria

The task is complete only when:

* All existing API playgrounds have a consistent layout.
* Each playground clearly explains what the API is used for.
* Each playground shows configuration status.
* Each playground shows endpoint-specific explanations.
* Each playground has guided form mode and raw JSON mode where applicable.
* Each playground has sample payloads.
* Each playground shows normalized output before raw response.
* Each playground shows raw response in a readable JSON viewer.
* Each playground shows errors with possible fixes.
* Each playground shows cache status.
* Each playground explains how the API connects to Carbon Compass AI.
* Playground tests do not silently create ActivityLog entries.
* API secrets are never shown.
* Playgrounds are blocked when disabled.
* UI is responsive and readable.
* Existing app design, colors, fonts, and main dashboard are preserved.
* The app builds successfully.
* TypeScript has no errors.
