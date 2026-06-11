# Authentication & User Management

Read `AGENTS.md` and the `context/architecture-context.md` before starting this feature.

## Goal

Set up authentication and user management using Clerk. Users must be able to sign up and log in to access the Carbon Compass application, and each successful login must create or update a corresponding user record in the database. All private pages and APIs should be protected by authentication, and users must have a way to log out.

## Implementation

- **Install and configure Clerk:** Install `@clerk/nextjs` if not already present. Configure Clerk with the required environment variables and wrap the root layout with `ClerkProvider` using the app’s theme. Use the `dark` theme if your UI is dark or override Clerk appearance variables with CSS custom properties defined in `globals.css`.
- **Middleware for route protection:** Create a `proxy.ts` or use the recommended Clerk middleware to protect all routes by default and allow only the sign‑in and sign‑up pages as public. Unauthenticated users should be redirected to `/sign-in`.
- **Auth pages:** Create `/sign-in` and `/sign-up` routes using Clerk’s `SignIn` and `SignUp` components. Use a minimal, two panel layout on desktop (logo and tagline on the left, form on the right) and a single panel form on mobile. Do not use gradients or hero sections.
- **Sync user profile:** Create a server action or API route (for example `POST /api/users/sync`) that runs after a successful sign‑in. This route should:
  - Check if a `User` record exists for the authenticated Clerk user (`clerkId`).
  - If it does not exist, create a new `User` record with `hasOnboarded = false` and default null values for profile fields.
  - If it exists, update the `name` and `email` fields from Clerk if they have changed.
- **Update Prisma schema:** Ensure the Prisma `User` model has a `clerkId` unique constraint and includes fields for the onboarding information (`city`, `state`, `country`, `householdSize`, `dietType`, `commuteMode`, `commuteDistance`, `monthlyKwh`, `monthlyBudgetKg`, `hasOnboarded`). Add relations to `Activity` and `AiMessage` models.
- **Protect API routes:** Wrap each API handler with authentication checks using Clerk’s `auth()` helper. Return `401` for unauthenticated requests and `403` if the user attempts to access resources belonging to another user.
- **User context hook:** Implement a client hook `useCurrentUser()` that calls a server action or API route to fetch the current user’s profile. The hook should handle loading and error states and expose the profile to client components.
- **Logout:** Add a `UserButton` or a custom logout button in the navigation bar that calls Clerk’s `signOut()` method. After sign‑out, the user should be redirected to `/sign-in`.

## Check When Done

- `@clerk/nextjs` is installed and configured with environment variables.
- A Clerk provider wraps the root layout and routes are protected by default.
- Sign‑in and sign‑up pages use Clerk components and follow the design guidelines (two panel on large screens, single panel on mobile). Colours and fonts use CSS custom properties; no hardcoded colours.
- A user record is created or updated in Prisma upon first login, with `hasOnboarded` initially false.
- All private API routes return `401` for unauthenticated requests and `403` when users access others’ data.
- `useCurrentUser()` returns the user’s profile data in client components.
- The logout button signs the user out and redirects to the sign‑in page without errors.
