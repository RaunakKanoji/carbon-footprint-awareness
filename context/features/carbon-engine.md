# Carbon Engine & Emission Factor Database

Read `AGENTS.md` and the `context/architecture-context.md` before starting this feature.

## Goal

Implement a pure carbon calculation engine and define a local emission factor database. The engine should support computing emissions for transport, electricity, food, shopping, waste and flights. It must be configurable, deterministic and easy to test.

## Implementation

- **Emission factor file:** Create a JSON file at `data/emission-factors.json` containing emission factors per unit for each category. Example values:

  ```json
  {
    "transport": {
      "petrolCar": 0.192,
      "dieselCar": 0.171,
      "bus": 0.105,
      "metro": 0.035,
      "train": 0.041,
      "bicycle": 0,
      "walking": 0
    },
    "electricity": { "indiaGrid": 0.71 },
    "food": {
      "veganMeal": 0.7,
      "vegetarianMeal": 1.2,
      "chickenMeal": 2.5,
      "fishMeal": 3.0,
      "beefMeal": 7.0
    },
    "shopping": { "tshirt": 7, "jeans": 33, "shoes": 14, "smartphone": 70, "laptop": 250 },
    "waste": { "generalWaste": 0.45, "foodWaste": 0.75, "plasticWaste": 1.2, "recycledWaste": 0.1 },
    "flight": { "economy": 0.158, "premiumEconomy": 0.253, "business": 0.395, "firstClass": 0.632 }
  }
  ```

- **Define types:** Create TypeScript types for transport modes, meal types, product types, waste types and cabin classes. Define interfaces such as `EmissionFactors` and `ActivityInput` to enforce structure in your functions.
- **Calculation functions:** In `lib/carbon-engine.ts`, implement pure functions for each category:
  - `calculateTransport(distanceKm: number, mode: TransportMode, passengers?: number): number`
  - `calculateElectricity(kWh: number, region?: string): number`
  - `calculateFood(servings: number, mealType: FoodType): number`
  - `calculateShopping(quantity: number, itemType: ProductType): number`
  - `calculateWaste(kg: number, wasteType: WasteType, recycled?: boolean, composted?: boolean): number`
  - `calculateFlight(distanceKm: number, cabinClass: CabinClass): number`
    Each function looks up the appropriate emission factor and multiplies by the quantity, applying modifiers (such as dividing by passengers or reducing waste when recycling).
- **Aggregation helpers:** Add functions like `sumByCategory()` and `sumByPeriod()` that accept arrays of `Activity` records and compute totals per category or per time period (day, week, month).
- **Entry point:** Expose a single function `calculateActivity(activity: ActivityInput): { co2e: number; emissionFactor: number }` that determines the category based on `activity.category`, calls the relevant calculation function and returns the CO₂e and factor used. Use this in API routes.
- **Configuration:** Support overriding the emission factor file via an environment variable (`EMISSION_FACTORS_FILE`). Load the JSON at runtime and merge it with the defaults if provided.
- **Tests:** Write unit tests using Vitest or Jest to cover each calculation function. Test normal inputs, edge cases (e.g. zero quantity) and invalid values. Ensure the functions are pure and deterministic.

## Check When Done

- A JSON file exists at `data/emission-factors.json` with factors for all categories described in the project overview.
- TypeScript types are defined for transport modes, meal types, product types, waste types and cabin classes.
- Pure calculation functions are implemented in `lib/carbon-engine.ts` for each category and include necessary modifiers (passengers, recycling, composting).
- Helper functions aggregate totals by category and time period.
- The entry point `calculateActivity()` routes to the correct calculation function and returns both the factor and the CO₂e value.
- The engine allows emission factors to be overridden via an environment variable.
- Unit tests exist and pass for the engine functions and helpers.
