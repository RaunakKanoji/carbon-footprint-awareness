# Progress Tracker

Update this file whenever the current phase, active feature or implementation state changes. It provides a summary of what has been done, what is in progress and what questions remain. Keep it concise but complete.

## Current Phase

- Implementation

## Current Goal

- Implement Carbon Footprint Simulator (Task 22).

## Completed

- Defined the project overview and objectives.
- Established the architecture context and system boundaries.
- Created the code standards document.
- Drafted the UI guidelines.
- Written the development workflow rules.
- Prepared feature specifications for all core features.
- Set up the Design System and UI Primitives (tasks/01-design-system.md).
- Configured the Global Theme (tasks/02-global-theme.md).
- Installed Project Dependencies (tasks/03-install-dependencies.md).
- Configured Tailwind and PostCSS (tasks/04-setup-tailwind-and-postcss.md).
- Configured Icons and Assets (tasks/06-setup-icons.md).
- Configured PostgreSQL and Prisma (tasks/07-setup-postgresql-and-prisma.md).
- Defined Prisma Schema Models (tasks/08-prisma-schema-models.md).
- Ran Migrations and Seed Data (tasks/09-prisma-migration-seed.md).
- Installed Clerk and Set Up Authentication (tasks/10-install-clerk-and-auth-setup.md).
- Build Authentication Context and Route Protection (tasks/11-auth-context-and-protection.md).
- Build Onboarding Form and Redirect Guard (tasks/12-onboarding-form.md).
- Create User Profile Page (tasks/13-user-profile-page.md).
- Implement Carbon Calculation Engine (tasks/14-carbon-engine-setup.md).
- Implement Activity Categories (tasks/15-activity-categories.md).
- Implement Activity Logging Forms (tasks/16-activity-logging-forms.md).
- Create API Endpoints for Activity Logs and Budgets (tasks/17-api-endpoints-for-logs.md).
- Build Dashboard Page (tasks/18-dashboard-page.md).
- Implement Carbon Budget Feature (tasks/19-budget-feature.md).
- Implement AI Copilot Integration (tasks/20-ai-copilot-integration.md).
- Build Chat UI and Streaming (tasks/21-chat-ui-and-streaming.md).
- Removed temporary developer test/demo pages.
- Removed local database files from Git tracking where necessary.
- Fixed React Hook Form watch usage in CategoryForms.tsx using useWatch.
- Polished and verified Tasks 18–21 surfaces.
- Confirmed dashboard, budget, AI copilot, and chat UI render safely.

## In Progress

- Ready to start Task 22: Build Carbon Footprint Simulator.

## Next Up

- Carbon Footprint Simulator (tasks/22-simulator.md).

## Open Questions

- Which AI provider will be used for the MVP (Gemini versus OpenAI)? This choice will affect the Trigger.dev workflow implementation.
- Should the initial release support multiple regions with region specific emission factors? If so, how will the user select their region and how will factors be overridden?

## Architecture Decisions

- Adopt a local emission factor database loaded from JSON for offline calculations.
- Use Clerk for authentication with PostgreSQL storing user profiles and activity logs.
- Trigger.dev will orchestrate AI calls and monthly resets of budget consumption.
- The application will run as a Next.js 16 serverless deployment on Vercel.

## Session Notes

- All context and feature files must be created and reviewed before coding begins.
- Ensure environment variables for Clerk, PostgreSQL and Trigger.dev are documented in the README or environment template.
- Re-read tasks/01-design-system.md and verified the design system primitives are present in the current repo: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea, components.json, lucide-react and the cn() helper in lib/utils.ts.
- Verification blockers outside tasks/01-design-system.md: the earlier duplicate jsx-a11y lint config issue was resolved during tasks/05-setup-linting-and-prettier.md; build gets past font fetching with network access but fails type checking in app/onboarding/page.tsx on the react-hook-form useForm export.
- Re-read tasks/02-global-theme.md and aligned Tailwind, CSS variables, the type-safe theme token module and the theme demo page with the UI context.
- Verification for tasks/02-global-theme.md: targeted Prettier check passes; the earlier duplicate jsx-a11y lint config issue was resolved during tasks/05-setup-linting-and-prettier.md; build compiles successfully with network access before failing on the existing app/onboarding/page.tsx react-hook-form useForm type error.
- Re-read tasks/03-install-dependencies.md and verified the Next.js TypeScript app scaffold, scripts and required package set; added missing direct dependencies @shadcn/ui, postcss and autoprefixer to package.json and package-lock.json.
- Verification for tasks/03-install-dependencies.md: npm install is up to date with 5 moderate audit findings; npx prisma -v reports Prisma 7.8.0 and @prisma/client 7.8.0; npx next -v reports Next.js 16.2.7; an existing Next dev server for this repo is running on localhost:3001 and logs show successful compiles. The earlier duplicate jsx-a11y lint config issue was resolved during tasks/05-setup-linting-and-prettier.md; build remains blocked by the onboarding react-hook-form type error. Git commit could not be performed because this directory is not a Git repository.
- Re-read tasks/04-setup-tailwind-and-postcss.md and aligned Tailwind/PostCSS setup with Next.js 16 and Tailwind CSS v4: configured root Tailwind content/theme/plugins, added postcss.config.js with @tailwindcss/postcss plus autoprefixer, confirmed globals.css imports Tailwind and theme variables, and added a /tailwind-test page for custom tokens, forms, prose, responsive utilities and dark class variants.
- Verification for tasks/04-setup-tailwind-and-postcss.md: targeted Prettier check passes; production build compiles CSS and application code successfully with network access before stopping at the existing app/onboarding/page.tsx react-hook-form useForm type error; the duplicate jsx-a11y lint config blocker was resolved during tasks/05-setup-linting-and-prettier.md.
- Re-read tasks/05-setup-linting-and-prettier.md and completed ESLint/Prettier setup for Next.js 16: fixed the flat ESLint config duplicate plugin issue, added the legacy .eslintrc.js reference config, confirmed .prettierrc and .editorconfig, documented linting/formatting locations in code-standards.md, and removed unsafe any usage from onboarding step validation.
- Verification for tasks/05-setup-linting-and-prettier.md: npm run lint passes; npm run lint:fix passes; npm run format passes; targeted Prettier check passes. Production build still compiles successfully with network access before stopping at the existing app/onboarding/page.tsx react-hook-form useForm type error.
- Re-read tasks/06-setup-icons.md and completed setup of Font Awesome icons and asset pipeline: created src/lib/icons.ts with FOUC prevention, created the reusable src/components/Icon.tsx component, registered all 13 required icons in the Font Awesome library, imported it in app/layout.tsx, created an interactive icons-demo page to verify layout/sizes/colors, and documented icons and assets in ui-context.md.
- Verification for tasks/06-setup-icons.md: ran linting, formatting, and verified typescript types; next build will be tested to confirm everything compiles successfully. The existing app/onboarding/page.tsx type error is out of scope.
- Re-read tasks/07-setup-postgresql-and-prisma.md and completed setup of PostgreSQL and Prisma ORM for Prisma 7 compatibility: provisioned the Docker Compose postgres:16 service on localhost:5432, configured .env and prisma.config.ts for DATABASE_URL, kept schema.prisma compatible with Prisma 7 datasource rules, installed @prisma/adapter-pg and pg, and updated lib/prisma.ts plus prisma/test-connection.ts to use the PrismaPg driver adapter.
- Verification for tasks/07-setup-postgresql-and-prisma.md: Docker reports the database container healthy; npx prisma validate passes; npx prisma generate succeeds; npx prisma db push reports the database is in sync with the Prisma schema; prisma/test-connection.ts prints the current database time and user table count.
- Re-read tasks/08-prisma-schema-models.md along with project-overview.md, architecture-context.md and code-standards.md. Verified schema.prisma includes User, Profile, EmissionFactor, ActivityLog, Budget, Conversation, ConversationMessage and Challenge models with typed enums, relations, cascade rules and query indexes. Documented the storage model and intentional deviations from the task template in architecture-context.md.
- Verification for tasks/08-prisma-schema-models.md: npx prisma validate passes; npx prisma generate succeeds; npx prisma db push reports the PostgreSQL database is in sync with the Prisma schema; prisma/test-client.ts verifies all model tables through Prisma counts.
- Re-read tasks/09-prisma-migration-seed.md and completed the initial Prisma migration and seed setup. Prisma detected stale local database migration history from previously missing migration files, so the empty local development database was reset and a fresh migration was created at prisma/migrations/20260611114553_init/migration.sql. Added prisma/seed.ts with idempotent upserts for 21 emission factor records, including Task 09 starter factors and existing local carbon engine factors. Configured Prisma 7 seeding in prisma.config.ts and kept package.json scripts for migrate/generate/seed convenience.
- Verification for tasks/09-prisma-migration-seed.md: npx prisma migrate status reports one migration and the database schema is up to date; Prisma Studio starts successfully on localhost:5566 with browser disabled; npx prisma db seed runs successfully and can be rerun without duplicates; prisma/test-client.ts reports 21 emission factors and zero user-owned records.
- Re-read tasks/10-install-clerk-and-auth-setup.md and verified @clerk/nextjs is installed. Added Clerk keys to .env.local from the existing local environment, wrapped the App Router root layout with ClerkProvider, kept Next.js 16 proxy.ts Clerk middleware in place, configured /sign-in and /sign-up with Clerk path routing and dashboard fallback redirects, and added a protected /dashboard route shell backed by components/dashboard/Dashboard.tsx.
- Verification for tasks/10-install-clerk-and-auth-setup.md: Next.js 16 proxy docs were checked before editing; npx tsc --noEmit passes; targeted ESLint passes for the auth and dashboard files. The installed Clerk v7 package exposes Show for signed-in/signed-out rendering instead of SignedIn/SignedOut, so the implementation uses Show and documents that API difference in architecture-context.md.
- Re-read tasks/11-auth-context-and-protection.md and completed setup of authentication context helpers and route protection: created custom react hook `useAuth.ts` merging Clerk and PostgreSQL profiles, created server action `auth-actions.ts` for database lookup, built core auth middlewares `auth.ts` with `requireAuth` (handling Clerk v7 asynchronous `clerkClient` signature) and database lazy-creation fallback, created procedure wrapper `withAuth.ts`, and built verification page `/auth-test`.
- Verification for tasks/11-auth-context-and-protection.md: `npx tsc --noEmit` and production `npm run build` compiled successfully. Manual testing of `/auth-test` via `curl` verifies that path-routed and protected page setups correctly match Clerk's `signed-out` and `signed-in` session rules.
- Fixed sidebar brand header height (setting `h-16`) to align its bottom border line with the topbar header next to it. Wrapped the root layout header in a `<Show when="signed-out">` conditional rendering wrapper to fix the double header layout clash when signed in. Reverted sign-in and sign-up buttons to Clerk's modal mode (`mode="modal"`) with matching emerald styles, and added a mobile-only `UserButton` container inside `AppTopbar` so signed-in mobile users can still sign out and manage their sessions easily when the main sidebar is hidden. Verification: `npx tsc --noEmit` and `npm run build` compiled successfully, and ESLint checks passed with zero errors or warnings.
- Re-read tasks/13-user-profile-page.md and completed implementation of the User Profile management page. Integrated the Clerk account settings triggers, grouped profile preferences into tabbed settings sections (General & Location, Transit & Utilities, Lifestyle & Budget), and implemented real-time baseline footprint calculations on the client side with a complete visual breakdown. Verified TypeScript type checks, ESLint rules, and Next.js production builds compile successfully.
- Re-read tasks/14-carbon-engine-setup.md and implemented the database-backed Carbon Calculation Engine. Added factor loading with in-memory caching in `lib/carbon-engine.ts`, input quantity and category validations, generic `calculateCo2e` lookup, specific category helper wrappers, and period-based aggregation (`sumActivitiesByCategory`). Created standard Vitest unit tests in `lib/carbon-engine.test.ts` covering 10 assertion cases and verified that all tests, linter configurations, and production builds compile successfully.
- Re-read tasks/15-activity-categories.md and established standardized activity categories and subtypes in `src/lib/activity-types.ts`. Mapped categories to label strings, color-coded Tailwind utility tags, and Font Awesome icon objects. Aligned types and enums with Prisma client schemas, and documented categories/subtypes definition details in `context/architecture-context.md`. Checked that type safety compiles cleanly and Vitest checks pass successfully.
- Re-read tasks/16-activity-logging-forms.md and implemented category-specific form components (`TransportForm`, `FoodForm`, `EnergyForm`, `ShoppingForm`, `WasteForm`) in `app/(app)/log/CategoryForms.tsx` using reusable form inputs (`ValidationError`, `NumberInput`, `SelectInput`, `TextareaInput`) stored in `src/components/forms/`. Each form validates itself via separate Zod schemas, computes client-side live estimates, and passes them up. Documented in `code-standards.md`.
- Re-read tasks/17-api-endpoints-for-logs.md and implemented secure Next.js API routes `/api/activity` and `/api/budget` with Zod input schema validations, database user lazily-loaded authorization checks, carbon calculation integrations, and PostgreSQL storage. Added API contracts to `architecture-context.md`. Example contracts: POST `/api/activity` expects `{ category, subType, quantity, passengers?, occurredAt?, note? }` and returns `{ success, logId, co2eKg }`. POST `/api/budget` expects `{ month, targetKg }` and returns `{ success, budgetId, targetKg }`. GET `/api/budget` returns budget targets and current calendar month summed activity consumption.
- Re-read tasks/18-dashboard-page.md and completed the implementation of the main Carbon Compass dashboard page at `/dashboard`. Set up data fetching inside the page Server Component (today's footprint, weekly trend, monthly budget target, category breakdowns, and the 5 most recent activities), created the loading skeleton component (`loading.tsx`) to improve visual perceived performance, and built the high-fidelity `DashboardClient` utilizing Recharts for weekly and category percentage distribution visualization. It features interactive metric summary cards, dynamic remaining budget indicators, a context-aware AI suggestion block based on the maximum emission category, and a recent activities table. Verified TypeScript compiles cleanly and linter checks pass with zero errors.
- Re-read tasks/19-budget-feature.md and completed implementation of the monthly carbon budget settings page at `app/(app)/settings/page.tsx` and the interactive client side form and budget history tracking table at `app/(app)/settings/SettingsClient.tsx`. The forms validate budget limits, normalized date values, and communicate with the `POST /api/budget` API securely. Changed dashboard warning flags in `components/dashboard/DashboardClient.tsx` to use the 80% consumption threshold. Verified TypeScript type checking, ESLint styles, and Vitest test runs with zero failures.
- Re-read tasks/20-ai-copilot-integration.md and completed implementation of the AI Carbon Copilot endpoint GET & POST `/api/copilot` in `app/api/copilot/route.ts` and the interactive chat window dashboard at `app/(app)/copilot/page.tsx` and `app/(app)/copilot/CopilotClient.tsx`. Prompts leverage monthly carbon consumption log breakdowns and budget remaining targets, supporting OpenAI/Gemini requests with a high-fidelity local mockup generator fallback. Conversations and messages are persisted in PostgreSQL. Verified TypeScript compiles cleanly and linter runs with zero errors.
- Completed Task 16 Activity Logging Forms connection: Created [LogClient.tsx](<file:///Users/admin/Code/carbon-footprint-awareness/app/(app)/log/LogClient.tsx>) to manage tabs, live footprint estimates, state, and form submissions, and updated [page.tsx](<file:///Users/admin/Code/carbon-footprint-awareness/app/(app)/log/page.tsx>) to enforce authentication/onboarding guards and render the dashboard forms layout. Verified with TypeScript compile and ESLint tests passing cleanly.
- Re-read tasks/21-chat-ui-and-streaming.md and completed implementation of the real-time AI Carbon Copilot streaming integration: updated POST `/api/copilot` in [route.ts](file:///Users/admin/Code/carbon-footprint-awareness/app/api/copilot/route.ts) to utilize `streamGenerateContent` Gemini endpoint, return a chunked `ReadableStream` with `x-conversation-id` header metadata, simulate word-by-word streaming for fallbacks, and write log entries to PostgreSQL on stream close. Updated [CopilotClient.tsx](<file:///Users/admin/Code/carbon-footprint-awareness/app/(app)/copilot/CopilotClient.tsx>) to consume streams with body reader hooks and progressively update UI state. Verified that TypeScript compilation, formatting, and ESLint compiler checks pass successfully.
- Completed application clean-up and polish task: deleted redundant developer test routes (`/app/auth-test`, `/app/icons-demo`, `/app/tailwind-test`, `/app/theme-demo`) and the unused SQLite database (`dev.db`). Refactored Form components in `CategoryForms.tsx` using `useWatch` and `control` to resolve all React compiler warnings. Verified formatting (`npm run format`), linting (`npm run lint`), unit tests (`npm run test`), and production build compile successfully.
- This commit is a cleanup and stabilization commit for Tasks 18–21 before continuing with later MVP work.
