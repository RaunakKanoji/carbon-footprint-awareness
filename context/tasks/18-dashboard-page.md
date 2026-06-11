# Build Dashboard Page

## Goal

Create the main dashboard where users can see their carbon footprint overview, track progress against their monthly budget, view a breakdown by category, and receive personalized suggestions. The dashboard serves as the landing page after onboarding or sign‑in.

## Implementation

1. **Create Dashboard Route:** Add a page at `app/dashboard/page.tsx`. Use `SignedIn` to restrict access. Redirect unauthenticated users to sign‑in and users with incomplete onboarding to the onboarding page.

2. **Fetch Data:** Use server components or tRPC to aggregate the following:
   - **Today’s Footprint:** Sum `ActivityLog` entries for the current day.
   - **This Week’s Footprint:** Sum entries from the last 7 days.
   - **Monthly Budget:** Retrieve the user’s `Budget` record for the current month. Calculate the remaining budget.
   - **Category Breakdown:** Group the last 7 days of activities by category and sum CO₂e for each.
   - **Trending Emission:** Compare the current week to the previous week to show improvements or regressions.

3. **Design UI Layout:** Use a responsive grid to arrange summary cards and charts. Components include:
   - **Summary Cards:** Small cards showing “Today’s Footprint”, “Weekly Footprint”, “Remaining Budget”, etc. Each card should have an icon, a primary value (e.g., 8.4 kg), and a label.
   - **Bar/Line Chart:** Use Recharts to visualize weekly emissions. X‑axis indicates days, Y‑axis indicates CO₂e. Different colors represent categories.
   - **Pie/Donut Chart:** Show the proportion of emissions by category. Use the `CategoryMetaMap` for colors and icons.
   - **Recommendation Panel:** Show the top personalized suggestion from the AI Copilot (from Task 20). Include a call‑to‑action button (e.g., “Learn More”) if needed.
   - **Recent Activities Table:** Display the five most recent activities with their category, quantity, and CO₂e.

4. **Implement Skeleton States:** While data is loading, display skeleton UI placeholders using shadcn/ui’s `Skeleton` component. This enhances perceived performance.

5. **Accessibility Considerations:** Ensure charts are accessible to screen readers by adding `aria-labels` and hidden captions. Provide textual summaries of key metrics for non‑visual users.

6. **Responsive Design:** Use Tailwind’s responsive utilities to ensure the dashboard adapts gracefully to mobile, tablet, and desktop screens. Rearrange cards and charts for narrow viewports.

## Check When Done

- Navigating to `/dashboard` renders summary cards, charts, and activity lists for the signed‑in user.
- Data is fetched efficiently and displayed without blocking the UI, using loading skeletons.
- Charts visually represent weekly trends and category breakdowns with color consistency.
- The recommendation panel surfaces a useful suggestion from the AI Copilot.
- Document the dashboard design choices and component composition in `progress-tracker.md` and cross‑reference UI guidelines from `ui-context.md`.
