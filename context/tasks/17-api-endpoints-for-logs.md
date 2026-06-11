# Create API Endpoints for Activity Logs and Budgets

## Goal

Implement secure server-side handlers to receive and process activity logs and budgets submitted by the client. These endpoints will calculate the CO₂e emissions using the carbon engine, persist the data to the database, and return the calculated results.

## Implementation

1. **Choose API Approach:** Decide whether to use Next.js API routes (`/app/api/...`) or server actions with the App Router. For explicit REST-like endpoints, API routes are suitable; for co-located mutations, server actions may be simpler. This specification assumes API routes for clarity.

2. **Create API Directory:** In the `app/api` folder, add subdirectories for each resource:
   - `/activity/route.ts`
   - `/budget/route.ts`

3. **Secure the Handlers:** At the top of each route file, import the authentication helper (`requireAuth`) from Task 11 to ensure only authenticated users can invoke these endpoints:

   ```ts
   import { NextResponse } from 'next/server';

   import { requireAuth } from '@/lib/auth';
   import { calculateCo2e } from '@/lib/carbon-engine';
   import prisma from '@/lib/prisma';

   export async function POST(req: Request) {
     const user = await requireAuth(req);
     const body = await req.json();
     // ... handle logic
   }
   ```

4. **Implement Activity Log Handler:** In `/app/api/activity/route.ts`, implement the POST handler that:
   - Validates and parses the request body for `category`, `subType`, `quantity`, and optional fields like `unit` and `passengers`.
   - Calls the carbon engine to compute CO₂e:
     ```ts
     const co2e = await calculateCo2e(category, subType, quantity / passengers);
     ```
   - Creates a new `ActivityLog` record via Prisma.
   - Returns JSON with the computed CO₂e and the created log ID.

5. **Implement Budget Handler:** In `/app/api/budget/route.ts`, implement POST and GET handlers:
   - **POST:** Accepts `{ month: string, targetKg: number }`, parses the date, and upserts a `Budget` record for the user.
   - **GET:** Returns the current month’s budget and consumption so far by aggregating the user’s `ActivityLog` data via Prisma. Compute remaining budget to display on the dashboard.

6. **Error Handling:** If authentication fails or input validation fails, return appropriate HTTP status codes (401 Unauthorized, 400 Bad Request). Use structured error messages for client consumption.

7. **Test Endpoints:** Use tools like Postman or curl to send requests with valid and invalid data. Verify responses and database state. Write integration tests later (see Task 29).

## Check When Done

- API route files exist for activities and budgets with POST handlers (and GET for budgets) implemented.
- Each handler authenticates the user, validates input, calculates CO₂e using the carbon engine, and persists data via Prisma.
- Endpoints return correct HTTP status codes and JSON payloads.
- Document the API contracts (request/response schemas) in `architecture-context.md` and add examples to `progress-tracker.md`.
