# Create User Profile Page

## Goal

Provide users with a dedicated profile page where they can view and update their personal information, including their name, avatar, and preferences captured during onboarding. This fosters transparency and ensures users can correct or update data that affects carbon calculations.

## Implementation

1. **Add Profile Route:** Create a new page at `app/profile/page.tsx`. Use the `SignedIn` wrapper to restrict access.

2. **Fetch Profile Data:** Use tRPC or server actions to fetch the authenticated user’s `Profile` record along with Clerk data. Implement a tRPC procedure (e.g., `profile.get`) to join user info with profile details. Use `useAuth` (see Task 11) to get the Clerk user ID and call your data fetching hook.

3. **Display User Information:** Show the user’s avatar and email via Clerk’s `UserButton` or `UserProfileLink`. Then display fields from the `Profile` model (city, country, household, diet, commute details, electricity usage). Organize fields in a clean, responsive layout.

4. **Allow Editing:** Provide form controls to update the information. This can reuse components from the onboarding form:
   - Use React Hook Form with a prefilled default values object.
   - Validate inputs with the same Zod schema used in onboarding.
   - On submission, call an update API route or server action (e.g., `PUT /api/profile`) that updates the record in the database.
   - After successful update, display a toast or success message and refresh the data.

5. **Change Avatar (Optional):** Leverage Clerk’s built‑in UI to update profile pictures. Alternatively, integrate a simple file upload and store the image in object storage (e.g., Cloudinary). This can be added in a later sprint.

6. **Handle Delete or Deactivate (Optional):** Provide a section to request account deletion or export data. In the MVP, you may defer actual deletion flows but design the UI for future expansion.

## Check When Done

- The `/profile` route displays user and profile information neatly formatted.
- Users can edit fields, and changes persist in the database.
- Form validation enforces the same constraints as the onboarding form.
- There is a clear success state after updates, and any errors are handled gracefully with feedback to the user.
- Document the profile management functionality in `progress-tracker.md` and update `architecture-context.md` if additional endpoints or models are created.
