You are a senior full-stack engineer, product architect, performance engineer, and AI coding agent working on my existing Carbon Compass application.

Your task is to implement structural and functional improvements only. Do not redesign the UI. Do not change the visual style. Do not change colors, typography, spacing, shadows, card styles, buttons, layout aesthetics, icons, or branding unless absolutely required to make an existing component function.

The goal is to make the app feel like a fully functioning prototype where the core structure, navigation, data flow, API usage, logging flows, product scanning, receipts, dashboard metrics, insights, coach, simulator, challenges, profile, and settings are all connected and usable.

This is not a visual polish task. This is an app architecture, routing, data, API, and functionality task.

---

# Primary Objective

Implement the improved Carbon Compass product structure:

1. Landing Page
2. Authentication
3. Lifestyle Onboarding
4. Carbon Profile Generated
5. Carbon Budget Setup
6. Dashboard
7. Log Activity
8. Products
9. Carbon Coach
10. Lifestyle Simulator
11. Insights
12. Challenges
13. Weekly Review
14. Profile
15. Settings

The app should feel smooth, fast, and functional. The user should be able to move through the complete product journey without dead ends.

---

# Critical Rules

## 1. Do Not Make Visual Changes

Do not modify:

* Existing theme
* Existing colors
* Existing fonts
* Existing font sizes
* Existing spacing system
* Existing border radius
* Existing shadows
* Existing card styles
* Existing button styles
* Existing sidebar or navigation styling
* Existing responsive design unless broken

You may add missing pages, sections, forms, and route structure using existing components and existing design patterns only.

Use the current UI system as-is.

If a new component is needed, build it using existing component styles and tokens.

---

## 2. Structural Changes Only

Focus on:

* Routes
* Pages
* Forms
* Data models
* API wiring
* State management
* Server actions / API routes
* Database persistence
* Navigation structure
* Validation
* Loading states
* Error handling
* Empty states
* Functional flows
* API audit
* Performance improvements

Do not spend time making the app prettier.

---

## 3. The App Must Feel Fast

Optimize for speed and smoothness.

Implement or verify:

* Fast route transitions
* Proper loading states
* No blocking UI where avoidable
* API calls should be cached where appropriate
* Avoid repeated duplicate API calls
* Debounce search inputs
* Use optimistic UI where safe
* Use server-side fetching where appropriate
* Use client-side fetching only when needed
* Avoid unnecessary re-renders
* Avoid loading all dashboard data if not needed
* Use lightweight fallback data for prototype mode when external APIs fail
* Add graceful error states for API failures

The app should feel responsive even when external APIs are slow.

---

# Existing APIs

The app already has several APIs integrated. Inspect the codebase and identify all existing API clients, API routes, SDK usage, utility functions, and environment variables.

Expected integrated APIs may include:

* CarbonSutra
* Climatiq
* Carbon Interface
* OpenRouteService
* Open Food Facts
* Agribalyse
* Any existing internal fallback engine
* Any local database emission factor tables

Do not remove existing APIs.

Do not replace existing APIs unless an implementation is broken.

Do not add unnecessary new APIs unless required.

---

# API Usage Requirement

Create or update an internal API usage map that clearly shows:

```txt
API Name
Purpose
Current status
Where it is used
Which app feature depends on it
Whether it is working
Whether it is unused
Reason if unused
Fallback behavior
```

Create this as a Markdown file:

```txt
docs/api-usage-audit.md
```

The file should identify:

1. APIs currently used by the app.
2. APIs integrated but not used anywhere.
3. APIs failing because of missing keys, invalid keys, auth issues, quota issues, or unavailable endpoints.
4. APIs intentionally unused because another API handles that feature.
5. APIs that should be used in the next implementation step.

Important rule:

If an API is not working, mark it clearly as unavailable/failing and do not count it as “unused waste.”

Example:

```txt
Carbon Interface
Status: Integrated but currently failing due to HTTP 401 authentication error.
Usage: Not used in production flow until key issue is fixed.
Fallback: CarbonSutra / Climatiq / internal factor engine.
Action: Keep integration but do not block the app.
```

---

# Required Product Flow

Implement this full user journey:

```txt
Landing Page
  ↓
Sign In / Sign Up
  ↓
Lifestyle Onboarding
  ↓
Carbon Profile Generated
  ↓
Carbon Budget Setup
  ↓
Dashboard
  ↓
Daily Loop
    - Log Activity
    - Upload Receipt
    - Scan Product
    - Ask Carbon Coach
    - Complete Mission
    - View Insight
    - Simulate Change
    - Weekly Review
```

No route should be a dead end.

Every major page should have at least one working primary action.

---

# Authentication Flow

Use the existing authentication setup.

After sign in:

1. Check if user has completed onboarding.
2. If not completed, redirect to onboarding.
3. If onboarding completed but carbon profile is not generated, redirect to carbon profile generation.
4. If carbon profile exists but budget is not configured, redirect to carbon budget setup.
5. If all setup steps are complete, redirect to dashboard.

Implement this routing guard cleanly.

Expected logic:

```txt
Authenticated user
  ↓
Has onboarding?
  no → /onboarding
  yes ↓
Has carbon profile?
  no → /carbon-profile
  yes ↓
Has carbon budget?
  no → /carbon-budget
  yes ↓
/dashboard
```

---

# Onboarding

Implement lifestyle onboarding as a functional setup flow.

The user should be asked lifestyle questions across these categories:

1. Food
2. Transport
3. Energy
4. Shopping
5. Waste
6. Travel
7. Household
8. Reduction goals

The onboarding should collect enough data to generate a baseline profile.

Minimum data to collect:

```txt
Country / region
Household size
Diet type
Meal frequency
Primary transport mode
Weekly commute distance
Vehicle fuel type if applicable
Electricity usage estimate or bill amount
Shopping frequency
Waste habits
Travel frequency
User goal preference
```

Save onboarding responses to the database.

Do not only store them in local state.

---

# Carbon Profile Generated

After onboarding, generate a baseline carbon profile.

The carbon profile should include:

```txt
Estimated monthly footprint
Estimated yearly footprint
Main impact category
Category breakdown:
  - Food
  - Transport
  - Energy
  - Shopping
  - Waste
  - Travel
Confidence level
Data sources used
Generated date
```

If exact API data is unavailable, use fallback estimates and mark confidence appropriately.

The user should be able to continue from this screen to Carbon Budget Setup.

---

# Carbon Budget Setup

Implement a carbon budget setup screen after carbon profile generation.

The user should be able to choose:

```txt
Easy goal: reduce 3%
Balanced goal: reduce 7%
Ambitious goal: reduce 15%
Custom goal
```

Save:

```txt
Monthly carbon budget
Weekly carbon budget
Reduction percentage
Target date
Budget type
```

The dashboard should use this budget.

---

# Dashboard

The dashboard should be structurally organized into these sections using existing visual components:

## 1. Carbon Snapshot

Show:

```txt
Today’s footprint
This week’s footprint
This month’s footprint
Carbon budget remaining
Carbon score
Main impact category
```

## 2. Quick Actions

Actions must navigate or trigger working flows:

```txt
Log Activity
Upload Receipt
Scan Product
Ask Carbon Coach
```

## 3. Progress Tracker

Show:

```txt
Current streak
Current level
Recent badge
Active mission
Challenge progress
```

## 4. Recent Activity

Show the latest activity logs.

Each activity item should show:

```txt
Category
Title
Date
Estimated CO₂e
Confidence
Data source
```

Clicking a recent activity should open the recent activity detail page.

## 5. Insight Messages

Show practical insight messages such as:

```txt
Transport caused 42% of your footprint this week.
Eating one plant-based meal saved around X kg CO₂e.
Your shopping footprint increased compared to last week.
You are within 72% of your monthly carbon budget.
```

Use real stored data where available. If not enough data exists, show safe prototype insights based on onboarding profile.

---

# Log Activity

Implement a functional Log Activity section.

Route:

```txt
/log
```

Subsections:

```txt
/log/food
/log/transport
/log/energy
/log/shopping
/log/waste
/log/travel
/log/receipt
/log/voice
```

Each log should:

1. Accept user input.
2. Validate input.
3. Estimate CO₂e.
4. Show result.
5. Save the activity.
6. Show confidence score.
7. Show data source.
8. Provide a better alternative or recommendation where possible.
9. Allow user to view the saved activity detail.

---

# Food Logging

Fields:

```txt
What did you eat?
Input options:
  - Search food
  - Scan barcode
  - Recent meals
  - AI meal description

Quantity:
  - grams
  - servings
  - plates
  - cups
  - pieces

Meal type:
  - Breakfast
  - Lunch
  - Dinner
  - Snack

Date and time
Notes
```

Result should show:

```txt
Estimated CO₂e
Impact level
Better alternative
Data source
Confidence score
```

Use:

* Open Food Facts for barcode/product data where applicable.
* Agribalyse for food LCA factors where applicable.
* Internal fallback factors where exact data is unavailable.

Example result:

```txt
Chicken rice bowl
Estimated impact: 3.8 kg CO₂e
Confidence: Medium
Source: Agribalyse / fallback category estimate

Suggestion:
A paneer or lentil bowl may reduce this meal’s impact by 35–60%.
```

---

# Transport Logging

Fields:

```txt
Trip type:
  - Commute
  - Errand
  - Travel
  - Delivery
  - Other

Route:
  - From
  - To
  - Automatic distance
  - Manual distance

Vehicle:
  - Walk
  - Bicycle
  - Bus
  - Train
  - Metro
  - Bike
  - Car
  - Flight

Vehicle details:
  - Fuel
  - Model
  - Mileage

Passengers
Date and time
Notes
```

Use:

* OpenRouteService for route and distance calculation.
* CarbonSutra / Climatiq / internal factors for transport emissions.
* Fallback manual distance if route API fails.

Result should show:

```txt
Estimated CO₂e
Comparison with other modes
Data source
Confidence score
```

Example:

```txt
Your trip:
Car: 4.2 kg CO₂e

Alternatives:
Metro: 0.8 kg CO₂e
Bus: 1.1 kg CO₂e
Bike: 0.4 kg CO₂e
```

---

# Energy Logging

Fields:

```txt
Region
Energy type:
  - Electricity
  - Natural Gas
  - Petroleum Gas
  - Diesel Generator
  - Solar

Usage:
  - kWh
  - Units from bill
  - Amount paid

Billing period:
  - Daily
  - Weekly
  - Monthly

Household members
Date and time
Notes
```

Result should show:

```txt
Total emissions
Per-person emissions
Budget comparison
Data source
Confidence score
```

Support bill upload where possible.

For prototype mode, receipt/bill upload may extract basic values using existing parsing utilities or a mocked review step, but the flow must exist.

---

# Shopping Logging

Shopping is for purchases already made.

Fields:

```txt
Product input:
  - Search product
  - Scan barcode
  - Paste URL
  - Upload receipt
  - Enter manually

Category:
  - Clothing
  - Electronics
  - Grocery
  - Beauty
  - Furniture
  - Household
  - Other

Details:
  - Brand
  - Material
  - Quantity
  - Price
  - New or used
  - Delivery method
  - Notes
```

Result should show:

```txt
Exact product footprint if available
Category average if exact product footprint is unavailable
Confidence score
Data source
Alternative
```

Example:

```txt
Estimated impact: 18 kg CO₂e
Confidence: Medium

We could not find verified data for this exact product, so we used the average footprint for wireless headphones.
```

---

# Waste Logging

Fields:

```txt
Waste type:
  - Plastic
  - Paper
  - Food Waste
  - E-waste
  - Metal
  - Glass
  - Mixed

Disposal:
  - Landfill
  - Recycled
  - Composted
  - Donated
  - Repaired

Weight
Date and time
Notes
```

Result should show:

```txt
Emissions generated
Emissions avoided
Data source
Confidence score
```

Example:

```txt
You recycled 2 kg of paper.
Estimated avoided emissions: 1.8 kg CO₂e.
```

Waste should support both negative footprint and avoided emissions.

---

# Travel & Stays Logging

Add Travel & Stays if not already present.

Fields:

```txt
Activity type:
  - Hotel stay
  - Flight
  - Train trip
  - Bus trip
  - Long-distance car trip

Location
Distance or number of nights
Number of people
Travel class / hotel type
Date and time
Notes
```

Result should show:

```txt
Estimated CO₂e
Impact level
Lower-carbon alternative
Data source
Confidence score
```

---

# Receipt Upload

Receipt upload should be a global feature, not only shopping.

Route:

```txt
/log/receipt
```

The receipt flow should support:

```txt
Food receipt
Grocery receipt
Electricity bill
Fuel receipt
Shopping receipt
Travel booking
Hotel bill
```

Functional flow:

```txt
Upload receipt
  ↓
Extract text/items if parser exists
  ↓
If extraction is not available, create manual review fields
  ↓
Classify category
  ↓
Show editable review screen
  ↓
Estimate footprint
  ↓
Save one or multiple activity logs
```

The user must always be able to review and edit extracted data before saving.

If OCR or parsing is not implemented, create the full structural flow with a manual review fallback.

Do not block the feature just because extraction is incomplete.

---

# Recent Activity Detail

Create a reusable activity detail page.

Route pattern:

```txt
/activity/[id]
```

Each activity detail should show:

```txt
Activity title
Category
Date
Inputs used
Estimated CO₂e
Emissions avoided if applicable
Impact level
Data source
Confidence score
Explanation
Better alternative
Related mission suggestion
Actions:
  - Edit
  - Delete
  - Ask Coach
  - Duplicate / Log again
```

This is important for trust and prototype completeness.

---

# Products

Products are for decision support, not activity logging.

Route:

```txt
/products
```

Sub-features:

```txt
Scan Product
Search Product
Paste Product Link
Compare Alternatives
Saved Products
My Owned Products
Product Lifetime Tracker
```

Product result should show:

```txt
Product name
Category
Brand
Estimated footprint
Confidence score
Data source
Exact product data or category fallback
Alternatives
Recommendation:
  - Buy
  - Avoid
  - Repair instead
  - Buy used
  - Keep existing product longer
```

Use:

* Open Food Facts for food/barcode products.
* Existing product/category factor logic for non-food.
* Agribalyse for food-related estimates.
* Internal fallback category engine when exact product footprint is unavailable.

---

# Product Lifetime Tracker

Allow the user to add owned products.

Fields:

```txt
Product name
Category
Brand
Estimated footprint
Purchase date
Condition
Usage frequency
Expected lifetime
Notes
```

Calculate:

```txt
Total estimated footprint
Owned duration
Current footprint per month
Projected footprint per month if kept longer
Recommendation
```

Example:

```txt
Sony Headphones
Estimated footprint: 35 kg CO₂e
Owned for: 14 months
Current impact per month: 2.5 kg CO₂e

Keeping this product longer reduces your monthly impact.
```

---

# Carbon Coach

Route:

```txt
/coach
```

The coach should communicate with user data.

It should support these questions:

```txt
Why was my footprint high this week?
What should I change first?
Give me 3 low-effort ways to reduce my footprint.
Why did this meal produce 4 kg CO₂e?
I ate chicken biryani and took an auto for 6 km.
What happens if I take metro 3 days a week?
Should I buy this product or repair my old one?
```

Functional requirements:

1. The coach should read from user activity logs, budget, profile, insights, and recent emissions.
2. The coach should be able to explain calculations.
3. The coach should recommend missions.
4. The coach should help create activity logs from natural language if possible.
5. The coach should gracefully say when there is not enough data.
6. The coach should not hallucinate exact data.
7. It should clearly distinguish actual user data from estimates.

Add a global “Ask Carbon Coach” action where possible, using existing components.

---

# Lifestyle Simulator

Route:

```txt
/simulator
```

Purpose:

Let users test “what if” lifestyle changes before committing.

Simulation examples:

```txt
Eat vegetarian 3 days a week
Use metro instead of car twice a week
Reduce electricity usage by 15%
Stop buying fast fashion for one month
Recycle food waste
Keep a product longer instead of replacing it
```

Simulator result should show:

```txt
Current monthly footprint
Simulated monthly footprint
Potential reduction
Goal progress
Affected categories
Confidence score
```

Add button:

```txt
Turn this into a mission
```

This should create a mission/challenge entry for the user.

---

# Insights

Route:

```txt
/insights
```

Insights should explain:

```txt
What happened?
Why did it happen?
What should the user do next?
```

Sections:

```txt
Weekly Overview
Monthly Trends
Category Breakdown
Biggest Emission Drivers
Best Improvements
Carbon Budget Performance
Personalized Suggestions
Forecast
```

Insight cards should connect to actions:

```txt
Ask Coach Why
Create Mission
View Related Logs
Open Simulator
```

Example insight:

```txt
Your transport footprint increased by 22% this week.

Reason:
You logged 3 car trips over 10 km.

Suggestion:
Replacing one car trip with metro could reduce around 3.4 kg CO₂e.
```

Use real data where available. Use onboarding-based estimates only when logs are insufficient.

---

# Challenges and Missions

Route:

```txt
/challenges
```

Use this hierarchy:

```txt
Missions = daily/weekly personalized actions
Challenges = larger goal-based programs
Streaks = consistency
Levels = long-term progress
Badges = achievements
Tasks = internal term only
```

Do not show too many gamification concepts equally.

Challenge types:

```txt
Starter Missions
Reduction Challenges
Habit Challenges
Community Challenges
```

Each challenge should include:

```txt
Difficulty
Estimated CO₂e saved
Time required
Progress
Reward
Status
```

Example:

```txt
Metro Monday
Take public transport once this week.

Estimated saving: 2–5 kg CO₂e
Difficulty: Easy
Reward: Streak boost + badge progress
```

Users should be able to:

```txt
Start challenge
Mark progress
Complete challenge
See reward
```

---

# Weekly Review

Route:

```txt
/weekly-review
```

Weekly Review should summarize:

```txt
Total weekly footprint
Comparison to previous week
Biggest source
Best improvement
Budget status
Missions completed
Streak status
Recommended next mission
```

Example:

```txt
Your Week in Carbon

Total footprint:
72 kg CO₂e

Compared to last week:
Down 8%

Biggest source:
Transport, 42%

Best improvement:
Food choices saved 5.2 kg CO₂e

Budget status:
You stayed within 84% of your weekly budget.

Recommended mission:
Replace two short car trips next week.
```

Actions:

```txt
Ask Coach About This
Set Next Week Goal
Turn Recommendation Into Mission
Share Progress
```

---

# Profile

Route:

```txt
/profile
```

Profile sections:

```txt
Personal Profile
  - Name
  - Country / region
  - Household size
  - Lifestyle type

Carbon Profile
  - Baseline footprint
  - Main categories
  - Reduction goal

Community Profile
  - Display name
  - City / local group
  - Public or private profile
  - Leaderboard preference

Achievements
  - Streaks
  - Badges
  - Completed challenges
  - Lifetime CO₂e reduced
```

Privacy is important. Let users choose what is public.

---

# Settings

Route:

```txt
/settings
```

Settings sections:

```txt
Account
Privacy
Data Controls
Notification Preferences
Units
  - kg CO₂e
  - miles/km
  - kWh
  - currency
Region
Connected Apps
API/Data Sources
Theme
Export Data
Delete Account/Data
```

Add a Data Sources & Accuracy section.

It should explain which estimates came from:

```txt
CarbonSutra
Climatiq
Carbon Interface
Open Food Facts
Agribalyse
OpenRouteService
Internal fallback engine
```

---

# Data Model Requirements

Inspect the existing database schema before editing.

Add or update models only if required.

The app should support persistence for:

```txt
User onboarding profile
Carbon profile
Carbon budget
Activity logs
Activity results
Products
Owned products
Missions
Challenges
Badges
Streaks
Insights
Weekly reviews
Coach conversations
Receipt uploads
API usage audit metadata if useful
```

Do not duplicate existing models.

Do not create conflicting schema names.

Use migrations safely.

If using Prisma:

1. Inspect current schema.
2. Add only necessary fields/models.
3. Run format.
4. Generate client.
5. Apply migration.
6. Test database queries.

---

# Estimation Engine Requirement

Create or improve a central estimation service.

Do not scatter carbon calculation logic randomly across components.

Suggested structure:

```txt
/lib/carbon/
  estimate-food.ts
  estimate-transport.ts
  estimate-energy.ts
  estimate-shopping.ts
  estimate-waste.ts
  estimate-travel.ts
  estimate-product.ts
  fallback-factors.ts
  confidence.ts
  data-sources.ts
```

Every estimate should return a consistent result object:

```ts
{
  co2eKg: number;
  avoidedCo2eKg?: number;
  category: string;
  source: string;
  sourceType: "api" | "database" | "fallback" | "manual";
  confidence: "high" | "medium" | "low";
  explanation: string;
  alternatives?: Array<{
    label: string;
    estimatedCo2eKg: number;
    savingsKg?: number;
  }>;
}
```

This consistency is critical.

---

# API Fallback Strategy

Every external API call should have:

```txt
timeout
error handling
clear failure reason
fallback path
logging
user-safe message
```

No page should crash if an API fails.

Example behavior:

```txt
OpenRouteService fails
  → Allow manual distance input
  → Estimate using manual distance
  → Mark confidence as medium or low
```

```txt
Open Food Facts has no product
  → Use product category fallback
  → Mark confidence as medium/low
```

```txt
Carbon Interface fails due to auth
  → Mark unavailable
  → Use CarbonSutra/Climatiq/internal fallback if available
```

---

# Performance Requirements

Audit and improve performance.

Implement:

```txt
Debounced search
Cached API responses
Avoid duplicate route fetches
Use server components where appropriate
Lazy load heavy client components
Avoid large client bundles
Avoid unnecessary global state
Use lightweight loading states
Use pagination or limits for recent activity
```

The app should not feel slow.

Add a short performance note:

```txt
docs/performance-notes.md
```

Include:

```txt
What was optimized
What still needs optimization
Known slow APIs
Fallback behavior
```

---

# Navigation Requirement

Desktop navigation should include:

```txt
Dashboard
Log
Products
Coach
Insights
Simulator
Challenges
Weekly Review
Profile
Settings
```

Mobile navigation should prioritize:

```txt
Home
Log
Scan
Coach
Insights
```

Do not redesign navigation visually. Only make the structure and links correct.

---

# Empty State Requirement

Every major page must have useful empty states.

Examples:

```txt
No activities yet → Log your first activity
No products saved → Scan your first product
No insights yet → Add a few logs to generate insights
No challenges active → Start your first mission
No weekly review yet → Complete your first week of logs
```

Empty states should guide the user to the next action.

---

# Testing Requirement

After implementation, run all relevant checks.

Run:

```txt
npm run lint
npm run typecheck
npm run build
npm run check:apis
```

If these scripts have different names in the project, inspect package.json and run the correct equivalent scripts.

Fix all TypeScript, lint, and build errors.

Do not leave broken routes.

Do not leave unused imports.

Do not leave console errors.

---

# API Health Check Requirement

Ensure the existing API health check script works.

If a script exists like:

```txt
scripts/check-apis.mjs
```

Update it to include all integrated APIs.

The output should show:

```txt
API name
PASS / FAIL / SKIPPED
Status code if available
Response time
Short details
Failure reason
```

Mark unavailable APIs clearly.

Do not fail the entire prototype if one optional API is unavailable.

---

# Prototype Completeness Requirement

The app should feel like a fully functioning prototype.

This means:

1. All main routes exist.
2. Main buttons work.
3. Forms save data.
4. Dashboard updates from saved data.
5. Recent activity works.
6. Product scanning/search structure works.
7. Receipt upload structure works.
8. Carbon Coach can reference user data.
9. Simulator produces a result.
10. Simulator can create a mission.
11. Insights are generated from logs/profile.
12. Weekly Review summarizes available data.
13. API failures are handled gracefully.
14. Unused APIs are documented.
15. No dead-end pages.
16. No broken navigation.
17. No visual redesign.

---

# Implementation Order

Follow this order:

## Phase 1: Audit

1. Inspect routes.
2. Inspect database schema.
3. Inspect API integrations.
4. Inspect current navigation.
5. Inspect dashboard data flow.
6. Inspect package scripts.
7. Create `docs/api-usage-audit.md`.

## Phase 2: Core Structure

1. Add missing routes.
2. Add setup flow guards.
3. Add onboarding persistence.
4. Add carbon profile generation.
5. Add carbon budget setup.
6. Connect dashboard to profile, budget, and logs.

## Phase 3: Logging

1. Implement food log.
2. Implement transport log.
3. Implement energy log.
4. Implement shopping log.
5. Implement waste log.
6. Implement travel log.
7. Implement receipt upload flow.
8. Implement activity detail page.

## Phase 4: Decision Features

1. Implement products page.
2. Implement product search/scan/link structure.
3. Implement owned products.
4. Implement product lifetime tracker.
5. Connect product estimates to fallback engine.

## Phase 5: Intelligence Features

1. Implement Carbon Coach data context.
2. Implement Insights.
3. Implement Simulator.
4. Implement “Turn simulation into mission.”
5. Implement Weekly Review.

## Phase 6: Gamification and Progress

1. Implement missions.
2. Implement challenges.
3. Implement streak logic.
4. Implement levels.
5. Implement badges.
6. Connect progress tracker to dashboard.

## Phase 7: Settings and Documentation

1. Add Data Sources & Accuracy section.
2. Add export/delete structure if missing.
3. Add API audit.
4. Add performance notes.
5. Run full checks.

---

# Final Acceptance Criteria

The implementation is complete only when:

```txt
User can sign in.
User can complete onboarding.
Carbon profile is generated.
Carbon budget is configured.
Dashboard shows real or fallback data.
User can log food.
User can log transport.
User can log energy.
User can log shopping.
User can log waste.
User can log travel.
User can upload a receipt through a working prototype flow.
User can view recent activity detail.
User can scan/search products through a working prototype flow.
User can add owned products.
Product lifetime tracker calculates monthly impact.
Carbon Coach can answer using user data.
Simulator creates scenario results.
Simulator can create a mission.
Insights page shows useful explanations.
Challenges/missions can be started and completed.
Weekly Review summarizes user data.
Profile and settings are functional.
Data sources and confidence are visible.
All integrated APIs are audited.
Unused APIs are documented.
Failing APIs are marked clearly.
No optional failing API breaks the app.
App builds successfully.
No visual redesign was done.
```

---

# Final Reminder

Do not make this a UI redesign.

Make the app structurally complete, smooth, quick, and functional.

The final product should feel like a working Carbon Compass prototype with all core flows connected, even if some estimates use fallback data when exact API results are unavailable.
