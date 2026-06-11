# Install Clerk and Set Up Authentication

## Goal

Integrate Clerk into the application for secure user authentication and management. This involves installing the necessary Clerk packages, configuring the provider, setting environment variables, and preparing the project to handle user sessions.

## Implementation

1. **Create a Clerk Account:** Go to [Clerk.dev](https://clerk.dev) and create an account. Create a new application named _Carbon Compass AI_. Note the **Publishable Key** and **Secret Key** from the Clerk dashboard.

2. **Install Clerk Packages:** Confirm that `@clerk/nextjs` is installed (see Task 03). If not, install it:

   ```bash
   npm install @clerk/nextjs
   ```

3. **Configure Environment Variables:** Add the Clerk keys to your `.env.local` file:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

   Use the `NEXT_PUBLIC_` prefix for keys required on the client side.

4. **Add Clerk Provider:** Wrap your root layout or `_app` component with the `ClerkProvider` to provide context across the app. Example for `app/layout.tsx` (App Router):

   ```tsx
   import { ClerkProvider } from '@clerk/nextjs';

   import { theme } from '@/styles/theme';

   import '../app/globals.css';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body className={theme.colors.background}>{children}</body>
         </html>
       </ClerkProvider>
     );
   }
   ```

   Adjust the `<body>` class to apply your theme's background color.

5. **Add Sign‑In and Sign‑Up Pages:** Use Clerk’s prebuilt components to handle authentication routes. Create pages at `app/(auth)/sign-in/[[...index]].tsx` and `app/(auth)/sign-up/[[...index]].tsx`:

   ```tsx
   import { SignIn } from '@clerk/nextjs';

   export default function SignInPage() {
     return <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />;
   }
   ```

   ```tsx
   import { SignUp } from '@clerk/nextjs';

   export default function SignUpPage() {
     return <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />;
   }
   ```

6. **Create a Protected Route Wrapper:** Use Clerk’s `SignedIn` and `SignedOut` components to protect certain pages. For example, wrap the dashboard route:

   ```tsx
   import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

   import Dashboard from '@/components/dashboard/Dashboard';

   export default function DashboardPage() {
     return (
       <>
         <SignedIn>
           <Dashboard />
         </SignedIn>
         <SignedOut>
           <div className="flex items-center justify-center h-screen">
             <p>You must sign in to view the dashboard.</p>
             <SignInButton mode="modal">Sign in</SignInButton>
           </div>
         </SignedOut>
       </>
     );
   }
   ```

7. **Test Authentication Flow:** Start the dev server and navigate to `/sign-in`. Create an account using Clerk’s UI. After signing in, ensure you’re redirected to the dashboard and that the `SignedOut` component is not displayed. Log out and verify the `SignedOut` state.

## Check When Done

- Clerk account is created and the application’s publishable and secret keys are stored securely in `.env.local`.
- `ClerkProvider` wraps the top‑level layout and provides context for child components.
- Sign‑in and sign‑up pages render properly using Clerk’s prebuilt components.
- Protected pages render only to authenticated users; non‑authenticated visitors are redirected or prompted to sign in.
- Document the auth setup in `architecture-context.md` and note any modifications in `progress-tracker.md`.
