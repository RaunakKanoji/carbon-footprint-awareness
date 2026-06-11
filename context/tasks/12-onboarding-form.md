# Build Onboarding Form

## Goal

Collect essential user information after sign‑up to personalize carbon tracking and recommendations. The onboarding form populates the `Profile` model with details such as city, household size, diet, commute type and distance, and electricity usage.

## Implementation

1. **Create Onboarding Route:** Make a new route at `app/onboarding/page.tsx`. Use Clerk’s `SignedIn` wrapper to ensure only logged‑in users can access it.

2. **Design the Form Layout:** Use shadcn/ui components such as `Form`, `FormField`, `Input`, `Select`, and `Button` to build an aesthetically pleasing and accessible form. Layout fields in a responsive grid.

   Fields to include:
   - Name (optional; can be prefilled from Clerk)
   - City (text input)
   - Country (text or select; default to “India” for local users)
   - Household size (number input)
   - Diet type (select: vegan, vegetarian, mixed, meat-heavy)
   - Commute type (select: car, bus, metro, bicycle, walking)
   - Commute distance (number input in km)
   - Monthly electricity usage (number input in kWh)

3. **Validate with Zod:** Define a Zod schema to validate form data. Use `react-hook-form` with the Zod resolver:

   ```ts
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';

   const onboardingSchema = z.object({
     name: z.string().min(2).optional(),
     city: z.string().min(2),
     country: z.string().min(2),
     household: z.number().min(1),
     diet: z.enum(['vegan', 'vegetarian', 'mixed', 'meat_heavy']),
     commuteType: z.enum(['car', 'bus', 'metro', 'bicycle', 'walking']),
     commuteDistanceKm: z.number().nonnegative(),
     electricityUsageKwh: z.number().nonnegative(),
   });
   ```

4. **Submit Handler:** On form submission, call a server action or API route to create or update the user’s profile in the database. For example:

   ```ts
   async function onSubmit(values: z.infer<typeof onboardingSchema>) {
     await fetch('/api/profile', {
       method: 'POST',
       body: JSON.stringify(values),
     });
     router.push('/dashboard');
   }
   ```

   Use the `withAuth` wrapper to ensure the user is authenticated on the server side.

5. **Save `onboardingComplete` Flag:** Set `onboardingComplete` to `true` on the `Profile` model after data is saved. Use this flag to redirect logged‑in users who haven’t completed onboarding to `/onboarding` automatically.

6. **Add Client‑Side Redirect Logic:** In `layout.tsx` or a custom hook, detect if the user’s profile is missing or incomplete and redirect accordingly. Example:

   ```tsx
   const { user } = useAuth();
   const { data: profile } = trpc.profile.get.useQuery();
   useEffect(() => {
     if (user && profile && !profile.onboardingComplete) {
       router.push('/onboarding');
     }
   }, [user, profile]);
   ```

## Check When Done

- The onboarding page only renders for authenticated users who have not completed onboarding.
- The form validates input using Zod and displays error messages appropriately.
- Submitting the form saves data to the `Profile` table and redirects to the dashboard.
- `onboardingComplete` flag prevents the form from showing again once completed.
- Document the onboarding flow in `progress-tracker.md` and link to relevant context in `architecture-context.md`.
