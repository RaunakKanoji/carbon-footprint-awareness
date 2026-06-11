# Implement Testing and Maintain Code Quality

## Goal

Ensure the reliability of the application through automated testing and maintain high code quality standards via continuous integration. Tests should cover unit logic (carbon engine), API endpoints, and critical UI flows.

## Implementation

1. **Set Up Test Framework:** Use Vitest for unit and integration tests. Ensure it’s installed as a dev dependency (Task 03). Configure a `vitest.config.ts` file:

   ```ts
   import tsconfigPaths from 'vite-tsconfig-paths';
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       globals: true,
       environment: 'jsdom',
     },
     plugins: [tsconfigPaths()],
   });
   ```

2. **Write Unit Tests:**
   - **Carbon Engine:** Test functions in `carbon-engine.ts` with various inputs and ensure correct CO₂e calculations and error handling. Mock emission factors as needed.
   - **Activity Logging Helpers:** Test validation schemas and helper functions used in forms.

   Example test file:

   ```ts
   import { calculateCo2e } from '@/lib/carbon-engine';

   test('calculate petrol car emissions', async () => {
     const result = await calculateCo2e('transport', 'petrolCar', 10);
     expect(result).toBeCloseTo(1.92);
   });
   ```

3. **API Endpoint Tests:** Use supertest or an equivalent library to test API routes. Verify that:
   - POST requests create logs and budgets correctly.
   - Unauthorized requests return 401.
   - Invalid input returns 400.

4. **Component Tests:** Write tests for key UI components using `@testing-library/react`. Validate that forms render, accept input, display validation errors, and call submission handlers.

5. **Integration Tests (Optional):** Use Playwright or Cypress to simulate end-to-end flows, such as signing up, completing onboarding, logging an activity, and viewing the dashboard. This is optional in the MVP but valuable for future improvements.

6. **Continuous Integration:** Set up a GitHub Actions workflow to run linting and tests on every pull request:

   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run lint
         - run: npm run test
   ```

7. **Maintain Code Coverage:** Add a coverage reporter to Vitest (e.g., `c8`). Aim for a reasonable coverage threshold (e.g., 80%) on the carbon engine and API layer. Discuss critical parts of the application that require testing.

## Check When Done

- Unit tests cover carbon calculation functions and return expected values.
- API route tests assert correct behavior for CRUD operations and error states.
- UI component tests ensure forms handle user interaction and validation properly.
- Continuous integration pipeline runs linting and tests on every commit and pull request.
- Test results and coverage reports are documented and referenced in `progress-tracker.md`.
