# Onboarding & Profile Setup

Read `AGENTS.md` and the `context/project-overview.md` before implementing this feature.

## Goal

Build a guided onboarding flow for new users. Collect baseline information to initialise their carbon profile, validate and persist it, and use it to compute an initial carbon estimate. Allow users to edit their profile later.

## Implementation

- **Detect first time login:** Check the `hasOnboarded` flag in the `User` record and redirect to the onboarding flow if it is `false`. Otherwise redirect to the dashboard.
- **Multi step form:** Implement a wizard with separate steps for basic details (location and household), diet and commute, energy usage and carbon budget. Use React state to manage form progress and persist partial values.
- **Validation:** Define Zod schemas for each step. Validate that numerical inputs are positive and within sensible ranges, and that required fields are not empty. Display inline error messages when validation fails.
- **Persist data:** Submit the completed form to a server action or API route (for example `PATCH /api/users/profile`) which updates the user’s record with the onboarding fields. This route must verify that the authenticated user matches the `User` being modified.
- **Initial carbon estimate:** After successful persistence, call the carbon engine using the onboarding data to calculate a baseline monthly footprint. Display this estimate to the user at the end of the onboarding process.
- **Set onboarding flag:** Update `hasOnboarded` to `true` on the user record to prevent the onboarding flow from showing again on future logins.
- **Profile editing:** Provide a settings page where users can view and edit their profile fields. When fields change, recalculate the baseline estimate and update the database via the same API route.

## Check When Done

- The onboarding flow appears automatically for users with `hasOnboarded = false` and does not show again once completed.
- The multi step form collects all required fields (location, household size, diet type, commute mode and distance, monthly electricity usage, monthly carbon budget) with validation.
- The onboarding data is saved to the `User` record via a server action or API route, and the `hasOnboarded` flag is set to `true`.
- An initial carbon estimate is calculated using the carbon engine and displayed to the user at the end of onboarding.
- Users can access a settings page to edit their profile and see updated estimates.
