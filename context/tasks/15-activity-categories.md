# Define Activity Categories and Types

## Goal

Standardize the classification of user activities by defining a fixed set of categories and subtypes. This ensures that activity logging, carbon calculations, and UI elements (icons, colors) remain consistent throughout the application.

## Implementation

1. **Establish Category Definitions:** Based on `project-overview.md`, define the following high-level categories:
   - **Transport:** Activities involving travel (car, bus, metro, train, cycling, walking).
   - **Food:** Consumption of meals (vegan, vegetarian, chicken, fish, beef, etc.).
   - **Energy:** Home electricity usage (grid, solar) and appliance usage (AC hours).
   - **Shopping:** Purchases of goods (clothing, electronics, furniture, etc.).
   - **Waste:** Waste generation (general waste, recycling, composting).
   - **Flights:** (Optional advanced category for long-distance travel; can be added later).

2. **Create Enumeration:** In TypeScript, define an enum and map of subtypes for each category. Example in `src/lib/activity-types.ts`:

   ```ts
   export enum ActivityCategory {
     Transport = 'transport',
     Food = 'food',
     Energy = 'energy',
     Shopping = 'shopping',
     Waste = 'waste',
   }

   export const ActivitySubTypes: Record<ActivityCategory, string[]> = {
     [ActivityCategory.Transport]: [
       'petrolCar',
       'dieselCar',
       'bus',
       'metro',
       'train',
       'bicycle',
       'walking',
     ],
     [ActivityCategory.Food]: [
       'veganMeal',
       'vegetarianMeal',
       'chickenMeal',
       'fishMeal',
       'beefMeal',
     ],
     [ActivityCategory.Energy]: ['indiaGrid', 'solar'],
     [ActivityCategory.Shopping]: ['tshirt', 'jeans', 'smartphone', 'laptop', 'shoes'],
     [ActivityCategory.Waste]: ['generalWaste', 'recycledWaste', 'foodWaste'],
   };
   ```

3. **Add Colors and Icons:** Define a mapping for UI presentation. Example:

   ```ts
   import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
   import {
     faBolt,
     faBus,
     faCar,
     faShoppingBag,
     faTrash,
     faUtensils,
   } from '@fortawesome/free-solid-svg-icons';

   export interface CategoryMeta {
     color: string;
     icon: IconDefinition;
     label: string;
   }

   export const CategoryMetaMap: Record<ActivityCategory, CategoryMeta> = {
     [ActivityCategory.Transport]: { color: 'bg-blue-500', icon: faCar, label: 'Transport' },
     [ActivityCategory.Food]: { color: 'bg-green-500', icon: faUtensils, label: 'Food' },
     [ActivityCategory.Energy]: { color: 'bg-yellow-500', icon: faBolt, label: 'Energy' },
     [ActivityCategory.Shopping]: {
       color: 'bg-purple-500',
       icon: faShoppingBag,
       label: 'Shopping',
     },
     [ActivityCategory.Waste]: { color: 'bg-red-500', icon: faTrash, label: 'Waste' },
   };
   ```

   Use these definitions in charts and cards to ensure visual consistency.

4. **Sync with Prisma Schema:** Ensure that the `ActivityCategory` enum in Prisma (if used) matches the TypeScript enum. Use generator options like `prismaClientType` to generate enum types automatically if needed.

5. **Document Categories:** Update `architecture-context.md` with definitions and rationale for each category and subtype. This helps future contributors understand why we chose these groupings.

## Check When Done

- `src/lib/activity-types.ts` exports a `ActivityCategory` enum and maps of subtypes, colors, icons, and labels.
- The UI uses `CategoryMetaMap` to render category badges, icons, and color-coded charts.
- The database schema’s `ActivityLog` model references the same categories and subtypes, preventing mismatches between client and database.
- Category definitions are documented in `architecture-context.md` for future reference.
