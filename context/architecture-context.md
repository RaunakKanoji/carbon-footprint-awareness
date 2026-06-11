# Architecture Context

This document defines the high level structure, boundaries, storage model, and invariants of the Carbon Compass AI system. It serves as a reference for all implementation work and should be kept up to date whenever architectural decisions change.

## Stack

| Layer            | Technology                     | Role                                                                                            |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript        | Full stack web app supporting server components, API routes and server actions                  |
| UI               | Tailwind CSS + shadcn/ui       | Component composition, utility first styling and accessible pre built elements                  |
| Authentication   | Clerk                          | User identity, session management and route protection                                          |
| Database         | Prisma ORM + PostgreSQL        | Persistent storage for user profiles, activities, budgets, AI messages and other metadata       |
| Carbon Engine    | Custom library + JSON factors  | Pure functions to calculate emissions from activity data using a local emission factor database |
| Charts           | Recharts                       | Client only chart library for visualising breakdowns and trends                                 |
| Background tasks | Trigger.dev                    | Durable workflows to orchestrate AI requests and scheduled resets                               |
| AI Provider      | Gemini or OpenAI (via Trigger) | Large language model used to generate personalised advice in the AI carbon copilot              |
| Code Review      | CodeRabbit                     | AI powered pull request analysis and feedback (not part of runtime system)                      |

## System Boundaries

The application is organised into clear directories representing different concerns. Respecting these boundaries prevents coupling between layers and keeps business logic testable.

- `app/api` -- API route handlers and server actions. Responsible for input validation, authentication, authorisation, calling the carbon engine, persisting data via Prisma and triggering background jobs. API handlers must not perform long running AI calls.
- `trigger` -- All Trigger.dev workflows. Encapsulates long running tasks such as AI prompt execution and scheduled jobs (for example monthly budget resets). These jobs are invoked from API routes or cron triggers and run independently of the request/response cycle.
- `lib` -- Shared infrastructure and utilities. Includes the Prisma client, carbon engine functions, emission factor loading, validation schemas and helper hooks (for example `useCurrentUser`). The carbon engine is pure (no side effects) so it can be imported in both client and server contexts.
- `components` -- UI composition. Contains React components built with shadcn/ui and Tailwind classes. Components must be strictly presentational; they should not access the database directly or perform side effects.
- `prisma` -- Database schema and generated client. Define all models (User, Activity, AiMessage, etc.) here. Migrations live under `prisma/migrations`.
- `data` -- Static data files such as `emission-factors.json` and `scenarios.ts`. These files are imported at runtime by the carbon engine or simulator.
- `features` -- (Documentation) Directory containing feature specifications. It does not contain runtime code but defines the required behaviour for each feature.

## Storage Model

The system uses a relational database (PostgreSQL) for all metadata and user specific records. Each table has a clearly defined purpose:

- **User**: stores the Clerk `clerkId`, unique email, optional display name and relations to all user owned records.
- **Profile**: stores onboarding and editable profile fields such as city, state, country, household size, diet type, commute mode, commute distance, monthly electricity usage and `onboardingComplete`.
- **EmissionFactor**: stores reusable factor metadata by category, subtype, unit and optional region. The schema keeps `source`, `isActive`, timestamps and a uniqueness constraint on `category`, `subType`, `unit` and `region` so regional overrides can coexist with defaults.
- **ActivityLog**: records user logged activities. Each row includes a `userId` foreign key, optional `emissionFactorId`, category enum, subtype, quantity, unit, factor used, computed `co2eKg`, optional note and occurrence timestamp.
- **Budget**: stores monthly carbon targets per user. The combination of `userId` and `month` is unique so each user has at most one target for a budget month.
- **Conversation**: stores AI copilot conversation metadata such as title, summary and optional JSON metadata.
- **ConversationMessage**: stores individual AI copilot messages with a role enum, content, optional JSON metadata and timestamp. This normalizes chat history instead of storing all messages in one JSON field, which keeps message level queries and pruning straightforward.
- **Challenge**: stores optional gamification tasks with category, reduction target, status, start and completion timestamps.

Prisma enums are used for activity categories, diet types, commute modes, conversation roles and challenge status to prevent typos in stored categorical data. Enum values are uppercase to match Prisma and TypeScript constant conventions.

Referential integrity is enforced with Prisma relations. User owned records cascade on user deletion. Activity logs keep historical emissions if an emission factor is removed by using `onDelete: SetNull` on the optional factor relation. Conversation messages cascade when their parent conversation is deleted.

Large data such as charts or simulation outputs are computed on the fly and not persisted. No binary assets are stored in this project; there is no external blob store in the MVP.

## Authentication and User Model

Authentication is delegated to Clerk. Each user has a unique Clerk ID (`clerkId`) which is used as the stable identifier in the local database. User accounts are private: users can only read and modify their own data. There is no concept of project ownership or collaborators in this application; all data is personal to the authenticated user.

The App Router root layout is wrapped with `ClerkProvider`, and Clerk is initialized for all application requests through the root `proxy.ts` file using Next.js 16's proxy convention. Public authentication pages live at `/sign-in` and `/sign-up` and render Clerk's prebuilt `SignIn` and `SignUp` components with path based routing. The installed Clerk package exposes `Show when="signed-in"` and `Show when="signed-out"` for conditional auth rendering, so protected route shells use `Show` rather than the older `SignedIn` and `SignedOut` component names.

The `/dashboard` route is the first protected page shell. It renders dashboard content only for signed in users and shows a Clerk sign-in prompt to signed out visitors. Deeper data synchronization between Clerk users and local Prisma `User` records is handled by the next authentication task.

Authorisation checks occur in API routes and server actions. Helpers in `lib/auth.ts` should wrap Clerk’s `auth()` to return the current `userId` and fetch the associated profile record. All route handlers must verify that the authenticated user matches the `userId` of any resource being mutated or retrieved.

## Carbon Engine

The carbon engine is a collection of pure functions located in `lib/carbon-engine.ts` backed by a static emission factor database (JSON) in `data/emission-factors.json`. It exposes calculation functions for each activity category as well as aggregation helpers. Calculation functions accept primitive inputs (distance, kWh, servings, etc.), look up the appropriate emission factor and return a numeric CO2e value in kilograms. These functions do not perform I/O and can run on both the client (for optimistic updates) and the server (for authoritative calculations).

Emission factors are separated from code to allow future regional overrides or updates without redeploying business logic. An environment variable can point to an alternate JSON file for regional factors.

## AI Workflow

AI interactions are orchestrated by Trigger.dev workflows defined under `trigger/`. These jobs handle constructing the AI prompt, executing the request to the LLM provider and returning the response back to the application. Because AI requests can take several seconds, they must never run inside API route handlers. Instead, the handler enqueues the job and returns immediately, while the client polls or listens for the response.

## Scheduled Tasks

Certain recurring actions, such as resetting the monthly budget consumption at the start of each month, are implemented as scheduled Trigger.dev workflows. These jobs iterate through users, reset counters and persist the results. Scheduled tasks must be idempotent and atomic; they must not run concurrently for the same user.

## Invariants

1. **Separation of concerns:** UI components never read from or write to the database directly; all persistence flows through API routes or server actions.
2. **Pure computation:** The carbon engine contains no side effects and no network calls. It can be called from any environment and will produce deterministic results given the same inputs and emission factors.
3. **Auth enforcement:** Every mutation of user data checks that the authenticated user owns the resource being modified.
4. **No long running tasks in handlers:** API routes trigger background jobs for AI interactions and scheduled resets; they never await LLM responses.
5. **Declarative UI:** Client components are declared with `"use client"` only when necessary (for example charts and interactive forms). Server components handle data fetching and pass props to client components.
6. **Update documentation:** Any change to these architectural decisions must be reflected in this file before code is written.
