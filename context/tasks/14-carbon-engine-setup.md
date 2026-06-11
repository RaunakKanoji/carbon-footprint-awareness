# Implement Carbon Calculation Engine

## Goal

Create a modular carbon calculation engine that converts user activities into estimated CO₂e emissions. The engine should reference official emission factors, support various categories (transport, food, energy, shopping, waste), and be easy to extend.

## Implementation

1. **Review Emission Factors:** Use the `EmissionFactor` table defined in Task 08 and seeded in Task 09. Confirm factors align with trusted sources like the UK Government conversion factors or CEA (for Indian grid factors). Document the sources in `project-overview.md`.

2. **Create Calculation Utilities:** In `src/lib/carbon-engine.ts`, implement utility functions for each category. Example:

   ```ts
   import { EmissionFactor, PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   // Generic calculation function
   export async function calculateCo2e(
     category: string,
     subType: string,
     quantity: number,
   ): Promise<number> {
     const factor = await prisma.emissionFactor.findUnique({
       where: { category_subType: { category, subType } },
     });
     if (!factor) throw new Error(`Missing emission factor for ${category}:${subType}`);
     return quantity * factor.factor;
   }

   // Specific helpers
   export async function calculateTransport(subType: string, distanceKm: number): Promise<number> {
     return calculateCo2e('transport', subType, distanceKm);
   }

   export async function calculateFood(subType: string, meals: number): Promise<number> {
     return calculateCo2e('food', subType, meals);
   }

   export async function calculateEnergy(kWh: number): Promise<number> {
     return calculateCo2e('energy', 'indiaGrid', kWh);
   }
   ```

   Factor lookups use a composite unique key `category_subType` defined in the Prisma schema. Adjust the schema accordingly if needed.

3. **Aggregate Calculations:** Provide functions to aggregate emissions over time or by category. Example:

   ```ts
   export async function sumActivitiesByCategory(userId: string, period: 'day' | 'week' | 'month') {
     // Use Prisma to sum co2e by category within the period
     // Return an object { transport: number, food: number, ... }
   }
   ```

4. **Error Handling:** Throw descriptive errors if emission factors are missing or if input values are invalid (e.g., negative distances). Wrap calls in try/catch at higher levels (API handlers) and return user-friendly messages.

5. **Caching (Optional):** To reduce database queries, cache emission factors in memory when the app starts. For example:

   ```ts
   let cachedFactors: Record<string, number> | null = null;
   async function loadFactors() {
     if (!cachedFactors) {
       const factors = await prisma.emissionFactor.findMany();
       cachedFactors = {};
       for (const f of factors) {
         cachedFactors[`${f.category}:${f.subType}`] = f.factor;
       }
     }
   }
   ```

   Use this cache in `calculateCo2e` instead of querying each time.

## Check When Done

- `src/lib/carbon-engine.ts` exports functions to compute emissions for different categories and aggregate results.
- The engine retrieves factors from the database and multiplies by the quantity provided.
- Error handling is implemented for missing factors or invalid inputs.
- The engine is unit tested (see Task 29) to ensure correct calculations and edge cases are covered.
- The engine is documented in `code-standards.md` and referenced where needed in API routes and components.
