# Build Authentication Context and Route Protection

## Goal

Provide a type-safe way to access the current authenticated user’s data throughout the application and ensure pages and API routes are properly protected. This builds on the Clerk integration by adding convenience hooks and enforcing authentication in server-side operations.

## Implementation

1. **Create an Auth Hook:** Make a custom React hook to access user data and profile information. Example:

   ```tsx
   // src/hooks/useAuth.ts
   import { useUser } from '@clerk/nextjs';
   import { User } from '@prisma/client';

   export function useAuth() {
     const { user, isLoaded, isSignedIn } = useUser();
     return { user, isLoaded, isSignedIn };
   }
   ```

   Extend this hook to fetch the full profile from the database via tRPC or a server action, enabling access to `Profile` fields like diet or commute type.

2. **Protect API Routes:** For server-side functions, ensure the request is authenticated. If using the `app/api` directory with the App Router, create a utility to get the session:

   ```ts
   // src/lib/auth.ts
   import { clerkClient } from '@clerk/nextjs/server';

   import { NextRequest } from 'next/server';

   export async function requireAuth(req: NextRequest) {
     const { userId } = auth(); // Provided by Clerk server helpers
     if (!userId) {
       throw new Error('Unauthorized');
     }
     const user = await clerkClient.users.getUser(userId);
     return user;
   }
   ```

   Use `requireAuth` in API handlers to fetch the user and ensure only authenticated requests are processed.

3. **Define a `withAuth` Wrapper:** Create a higher-order function to wrap server actions or tRPC procedures that require authentication:

   ```ts
   // src/lib/withAuth.ts
   import { requireAuth } from '@/lib/auth';

   export function withAuth<TArgs, TResult>(handler: (user: any, args: TArgs) => Promise<TResult>) {
     return async (args: TArgs, context: { req: NextRequest }) => {
       const user = await requireAuth(context.req);
       return handler(user, args);
     };
   }
   ```

   This pattern centralizes authentication logic and reduces repetition.

4. **Protect Routes in App Router:** Leverage Clerk’s `SignedIn` and `SignedOut` components for client‑side route protection (as shown in Task 10). For server components or pages that fetch data (e.g., Dashboard), ensure you call server helpers like `requireAuth` before running database queries.

5. **Test Unauthorized Access:** Attempt to access a protected API route or page without being signed in. Confirm that you receive an error or are redirected to sign in.

## Check When Done

- `useAuth` returns user data and loaded state for client components.
- `requireAuth` or `withAuth` is used in all API handlers, server actions, or tRPC routers that require authentication.
- Unauthorized requests are blocked and do not leak data.
- The authentication logic is reusable and well‑documented in `architecture-context.md`.
