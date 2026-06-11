# Define Prisma Schema Models

## Goal

Create database models that represent core entities in the carbon tracking application. These models include users, profiles, activities, emission factors, budgets, and AI conversations. The models should be relational, extensible, and optimized for common queries.

## Implementation

1. **Review Requirements:** Read `project-overview.md` and `architecture-context.md` to understand the entities and relationships needed. Key entities are:
   - **User:** The authenticated account managed by Clerk. Contains identity and basic account info.
   - **Profile:** Extended user details collected during onboarding (city, household size, diet, commute).
   - **EmissionFactor:** Predefined emission values for transport modes, food categories, energy sources, etc.
   - **ActivityLog:** Individual actions logged by the user (e.g., 10 km car ride, 2 vegetarian meals).
   - **Budget:** Monthly carbon budget set by the user.
   - **Conversation:** Stores AI Copilot conversations for personalization and context.
   - **Challenge:** Optional gamified tasks (for later tasks).

2. **Add Models to `schema.prisma`:** Open `prisma/schema.prisma` and append models. Use the following template (adapt field names to suit your needs):

   ```prisma
   model User {
     id            String   @id @default(cuid())
     clerkId       String   @unique // ID from Clerk
     email         String   @unique
     profile       Profile?
     activities    ActivityLog[]
     budgets       Budget[]
     conversations Conversation[]
     challenges    Challenge[]
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
   }

   model Profile {
     id           String   @id @default(cuid())
     userId       String   @unique
     user         User     @relation(fields: [userId], references: [id])
     name         String?
     city         String?
     country      String?
     household    Int?
     diet         String?  // e.g., vegan, vegetarian, mixed
     commuteType  String?  // e.g., car, bus, metro
     commuteDistanceKm Float?
     electricityUsageKwh Float?
     onboardingComplete Boolean @default(false)
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
   }

   model EmissionFactor {
     id          String   @id @default(cuid())
     category    String   // transport, food, energy, shopping, waste
     subType     String   // e.g., petrolCar, veganMeal
     unit        String   // km, meal, kWh, item, kg
     factor      Float    // kg CO2e per unit
     description String?
   }

   model ActivityLog {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     category    String
     subType     String
     quantity    Float
     unit        String
     co2e        Float
     createdAt   DateTime @default(now())
   }

   model Budget {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     month     DateTime // first day of the budget month
     targetKg  Float    // the monthly CO2e target in kg
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   model Conversation {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     messages  Json     // store chat history
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }

   model Challenge {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     title       String
     description String?
     targetCo2e  Float   // reduction target
     completed   Boolean @default(false)
     createdAt   DateTime @default(now())
     completedAt DateTime?
   }
   ```

3. **Use Enums (Optional):** For improved type safety, define enums in the schema for categories and diet types:

   ```prisma
   enum ActivityCategory {
     transport
     food
     energy
     shopping
     waste
   }

   model ActivityLog {
     // ...
     category ActivityCategory
     // ...
   }
   ```

   Update related fields accordingly, and regenerate the Prisma client.

4. **Referential Integrity:** Use `@relation` annotations to connect foreign keys. Include `onDelete` policies (e.g., `onDelete: Cascade`) if you want to cascade deletions. Document these choices in `architecture-context.md`.

5. **Generate and Validate Models:** Run `npx prisma generate` to generate the client types and ensure there are no syntax errors. Run `npx prisma validate` to check schema correctness.

## Check When Done

- `schema.prisma` contains all defined models with appropriate fields, relations, and optional enums.
- The Prisma schema compiles successfully and the client is regenerated without errors.
- All models adhere to the relationships and naming conventions described in `project-overview.md` and `code-standards.md`.
- Document any decisions or deviations (e.g., field names, cascade rules) in `architecture-context.md` for future reference.
