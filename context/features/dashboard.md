# Dashboard & Visualisation

Read `AGENTS.md`, `context/ui-context.md` and `context/project-overview.md` before implementing this feature.

## Goal

Create a responsive dashboard that summarises the user’s carbon footprint across different time frames, visualises category breakdowns and trends, tracks budget progress and surfaces personalised recommendations.

## Implementation

- **Layout:** Use a responsive grid to arrange summary cards at the top, charts in the middle and recommendations at the bottom. Ensure the layout adapts to mobile and desktop sizes without overflowing.
- **Summary cards:** Implement four reusable card components:
  - **Daily Total:** display today’s total CO₂e emissions.
  - **Weekly Total:** display emissions over the last seven days.
  - **Monthly Total:** display emissions for the current calendar month.
  - **Remaining Budget:** calculate the remaining budget by subtracting the month’s total from the user’s `monthlyBudgetKg`.
- **Category breakdown:** Render a pie chart using Recharts that visualises the percentage contribution of each category (transport, electricity, food, shopping, waste, flights) for the selected period (day/week/month). Colour segments according to the palette specified in `ui-context.md`.
- **Trend chart:** Render a bar or line chart (using Recharts) showing daily emissions for the past week or month. Provide tooltips with precise values and highlight today’s point.
- **Top contributors:** Display a list of the top emission sources or categories for the selected period. Each entry should link back to its underlying activity log for quick editing.
- **Recommendations:** Include a panel that shows up to three actionable suggestions, either from the AI copilot or a local recommendation engine. Each suggestion should include an estimated CO₂e reduction.
- **Data loading:** Fetch aggregated data via a server action or API route (for example `GET /api/dashboard?period=week`). Use client components with SWR or React Query to fetch and cache the data. Show loading skeletons or spinners while data is being fetched.
- **Error handling:** Handle fetch errors gracefully by displaying a user friendly message and providing a retry option.

## Check When Done

- Authenticated users see the dashboard without errors and the layout adapts to different screen sizes.
- Summary cards display accurate totals for today, this week and this month, as well as remaining budget.
- The pie chart shows the correct category breakdown and uses the defined colour palette.
- The trend chart correctly plots daily emissions for the chosen period and includes tooltips.
- A list of top contributors is shown and links to the respective activity logs.
- A panel displays up to three personalised recommendations that update when the user’s data changes.
- API routes aggregate and return the necessary data, and client components handle loading and errors.
