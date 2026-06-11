# Implement Carbon Budget Feature

## Goal

Provide users with the ability to set and track a monthly carbon budget. The app should display progress against this budget on the dashboard, warn users when they approach their limit, and encourage them to stay within their sustainability goals.

## Implementation

1. **Extend the `Budget` Model:** Ensure the `Budget` model in Prisma includes fields for `month` (first day of month) and `targetKg` (CO₂e target). See Task 08 for initial definition.

2. **Budget API:** Use the `/app/api/budget/route.ts` created in Task 17 to handle budget creation and retrieval:
   - **POST**: Accept JSON `{ month: string, targetKg: number }`. Parse the date as the first day of the month (e.g., `2026-06-01`) and upsert a `Budget` for the user. Return the newly created or updated budget.
   - **GET**: Return the user’s budget for the current month along with their current emissions to calculate remaining budget.

3. **Budget Setting UI:**
   - In the profile or settings page, provide a form where users can set or update their monthly budget. Use an input field for the number of kilograms and a date picker (or dropdown) for selecting the month. Validate that the value is positive.
   - On submission, call the Budget API’s POST method to save the new budget.
   - Display success/failure messages.

4. **Budget Display on Dashboard:**
   - On the dashboard, show a progress bar or radial gauge that illustrates how much of the monthly budget has been used. Use the ratio of total emissions this month to the target (e.g., 45 kg used out of 100 kg budget → 45%).
   - Highlight when consumption exceeds 80% of the budget (e.g., change color to red or display a warning icon).
   - Provide contextual text (e.g., “You have 20 kg CO₂e left this month”).

5. **Notifications (Optional):** As a stretch goal, schedule background jobs via Trigger.dev (Task 27) to send weekly reminders or alerts when users exceed their budget. Integrate with email or push notifications.

## Check When Done

- Users can set or update their monthly carbon budget via a form in their profile or settings page.
- Budget API routes upsert and fetch budgets securely for authenticated users.
- The dashboard displays the monthly budget and current usage with clear indicators when nearing or exceeding the target.
- Warnings or alerts appear when consumption crosses thresholds (e.g., 80%).
- Document the budget feature design, API contracts, and UI decisions in `progress-tracker.md` and `architecture-context.md`.
