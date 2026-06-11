# Code Standards

These standards establish consistent practices across the Carbon Compass AI codebase. Following them helps ensure maintainability, readability and reliability.

## General

- Write small, single‑purpose modules with descriptive names. A function or component should do one thing well.
- Fix root causes rather than layering workarounds or patches on top of broken abstractions.
- Keep UI presentation separate from business logic. React components should be concerned with rendering and interaction, while data manipulation lives in `lib/` or API routes.
- Respect the system boundaries defined in `architecture-context.md`; do not couple unrelated layers.
- Write unit tests for pure functions, particularly the carbon engine.

## TypeScript

- Use strict mode across the repository. Enable `noImplicitAny`, `strictNullChecks` and related flags.
- Avoid `any`; prefer explicit types and generics. If unknown external input must be accepted, refine it as soon as possible via validation.
- Validate request payloads and query parameters at the boundary using Zod or a similar schema library.
- Use `interface` or `type` to define data contracts; prefer `type` for unions or aliases and `interface` for object shapes with methods.
- Use enums or string literal unions for categories (e.g. `ActivityCategory`, `DietType`) to prevent typos.

## Next.js

- Default to React Server Components (RSC). Only add the `"use client"` directive when a component needs browser APIs such as state, event handlers, context, or third‑party client libraries like Recharts.
- Organise pages under the `app/` directory following Next.js conventions. Use nested route segments and layout files for shared layouts.
- Use API routes or server actions (`app/api`) for all operations that read from or write to the database or trigger background tasks. Never call Prisma directly from client components.
- Avoid long running operations in route handlers; offload them to Trigger.dev workflows. Handlers should respond promptly.

## Styling

- Use Tailwind CSS utility classes together with CSS custom properties defined in `globals.css`. Do not hardcode hex values or use raw Tailwind colour classes like `emerald-500`. Instead reference tokens such as `bg-base`, `text-primary`, `border-default`, `text-accent-primary`.
- Maintain a consistent border radius scale: small inputs and buttons use `rounded-lg`, cards use `rounded-xl`, modals use `rounded-2xl`.
- Use Flexbox and CSS Grid to create responsive layouts. Avoid absolute positioning unless absolutely necessary.
- Avoid inline styles except for dynamic values that cannot be expressed via Tailwind classes.

## API Routes

- Validate and parse request input at the very beginning of each handler using schemas. Reject invalid input with a `400` response before any side effects occur.
- Enforce authentication and ownership checks before performing any database operation. Use helpers from `lib/auth.ts` to get the current user.
- Return JSON responses with a consistent structure. At minimum: `{ success: boolean, data?: any, error?: string }`.
- Handle errors gracefully. Never expose internal stack traces or Prisma errors to the client. Log server errors to standard output instead.
- Keep handlers focused on a single responsibility. Delegate shared or complex logic to functions in `lib/`.

## Data and Storage

- All persistent data is managed through Prisma. Do not use raw SQL in application code.
- Only store metadata and computed values in the database. Do not persist large binary payloads or charts.
- Use model relations and enumerated types to enforce referential integrity and reduce duplication.
- Use Prisma migrations to evolve the schema; never alter the database schema manually.
- Load static data (emission factors, scenarios) from the `data/` directory. Do not hardcode these values in code.

## File Organisation

- `lib/` — shared infrastructure: Prisma client, carbon engine, helpers, hooks and validations.
- `components/` — UI components only; they receive props and render UI. Do not include business logic here.
- `app/api/` — API route handlers and server actions. Responsible for validation, auth checks, persistence and calling background jobs.
- `trigger/` — Trigger.dev jobs and workflows. All long running tasks and scheduled jobs live here.
- `data/` — JSON files and TypeScript modules containing static data such as emission factors and predefined scenarios.
- `features/` — Markdown feature specifications (documentation only).

## Naming

- Use descriptive names for variables, functions and files. Avoid abbreviations and single letter names except for loop indices.
- Name Prisma models with singular nouns (e.g. `Activity`, `User`). Use plural names only for tables if required by Prisma conventions.
- Use camelCase for variables and functions, PascalCase for React components and Prisma models, and kebab-case for file names.

## Testing

- Write unit tests for the carbon engine and any pure utility functions. Use deterministic inputs and verify outputs against known values.
- Use integration tests for API routes to verify validation, authentication and persistence. Spin up a test database for these tests.
- Mock external services (for example AI providers) in tests to ensure determinism and avoid network calls.

## Linting and Formatting

- ESLint uses the Next.js 16 flat config in `eslint.config.mjs`; `.eslintrc.js` is kept as a legacy reference for the rule set described in the task docs.
- Prettier uses `.prettierrc` with Tailwind class sorting and deterministic import ordering.
- Editor whitespace defaults live in `.editorconfig`.
- Run `npm run lint` before code review and `npm run format` before handoff.
