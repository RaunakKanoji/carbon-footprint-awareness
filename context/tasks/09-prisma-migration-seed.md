# Run Migrations and Seed Data

## Goal

Apply database migrations based on the defined Prisma models and populate initial data such as emission factors and default challenges. This ensures the database is ready for development and testing.

## Implementation

1. **Create Migration:** After updating `schema.prisma` (see Task 08), generate a migration with a descriptive name:

   ```bash
   npx prisma migrate dev --name init
   ```

   This command creates a new migration file under `prisma/migrations/` and applies it to the development database. Inspect the generated SQL to understand how tables are created.

2. **Verify the Database:** Use Prisma Studio to confirm the schema is applied correctly:

   ```bash
   npx prisma studio
   ```

   Navigate through the tables to see that all models (User, Profile, EmissionFactor, ActivityLog, Budget, Conversation, Challenge) exist with the correct columns.

3. **Write Seed Script:** Create a file `prisma/seed.ts` to insert initial data. For example:

   ```ts
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();
   async function main() {
     // Insert emission factors
     await prisma.emissionFactor.createMany({
       data: [
         {
           category: 'transport',
           subType: 'petrolCar',
           unit: 'km',
           factor: 0.192,
           description: 'Petrol car per km',
         },
         {
           category: 'transport',
           subType: 'dieselCar',
           unit: 'km',
           factor: 0.171,
           description: 'Diesel car per km',
         },
         {
           category: 'transport',
           subType: 'bus',
           unit: 'km',
           factor: 0.105,
           description: 'Bus per km',
         },
         {
           category: 'transport',
           subType: 'metro',
           unit: 'km',
           factor: 0.035,
           description: 'Metro per km',
         },
         {
           category: 'food',
           subType: 'veganMeal',
           unit: 'meal',
           factor: 0.7,
           description: 'Vegan meal',
         },
         {
           category: 'food',
           subType: 'vegetarianMeal',
           unit: 'meal',
           factor: 1.2,
           description: 'Vegetarian meal',
         },
         {
           category: 'food',
           subType: 'chickenMeal',
           unit: 'meal',
           factor: 2.5,
           description: 'Chicken meal',
         },
         {
           category: 'food',
           subType: 'beefMeal',
           unit: 'meal',
           factor: 7.0,
           description: 'Beef meal',
         },
         {
           category: 'energy',
           subType: 'indiaGrid',
           unit: 'kWh',
           factor: 0.71,
           description: 'India grid electricity (kg CO2e per kWh)',
         },
       ],
     });

     // Optionally insert default challenges or budgets
   }
   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

   Expand the dataset according to research sources for emission factors (see carbon engine documentation). Be sure to include emission factors for waste and shopping categories later if desired.

4. **Configure Seeding:** Update `package.json` to run the seed script after generating the Prisma client:

   ```json
   {
     "prisma": {
       "seed": "ts-node --compiler-options {\"module\":\"commonjs\"} prisma/seed.ts"
     }
   }
   ```

   Then run:

   ```bash
   npx prisma db seed
   ```

5. **Test Seed Data:** Open Prisma Studio again and verify that emission factors and any other seeded entities appear as expected.

## Check When Done

- Migration files exist in `prisma/migrations/` with a clear name and have been applied to the database.
- Prisma Studio reflects the correct table structure and seeded data.
- `prisma/seed.ts` populates emission factors, and running `npx prisma db seed` successfully inserts records without duplicates.
- Document in `progress-tracker.md` when migrations are applied and seeds are run. Update `architecture-context.md` if any assumptions changed during migration.
