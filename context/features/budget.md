# Carbon Budget & Insights

Read `AGENTS.md` and `context/project-overview.md` before implementing this feature.

## Goal

Give users the ability to set a monthly carbon emissions limit, track their progress against this budget and receive insights when they are approaching or exceeding the limit. Provide clear visual indicators and reset the budget consumption at the start of each month.

## Implementation

- **Profile field:** Ensure the `User` model includes a `monthlyBudgetKg` field (added during the authentication feature). Provide a sensible default if the user does not set one during onboarding.
- **Budget settings UI:** Add a slider or numeric input in the settings page for users to set or adjust their monthly carbon budget. Validate that the value is positive and within a reasonable range (for example 50–5000 kg CO₂e).
- **Budget calculations:** Aggregate the user’s activities for the current month and compute the total CO₂e consumed. Calculate the remaining budget by subtracting this total from `monthlyBudgetKg`.
- **Visual indicators:** On the dashboard, display a progress bar or radial gauge representing budget consumption. Colour the indicator green when under 75% of the budget, yellow between 75% and 100%, and red when the budget is exceeded. Show the numerical values (budget, consumed, remaining) alongside the visual indicator.
- **Alerts:** If the user exceeds their budget, display a warning message on the dashboard. Provide suggestions for reducing emissions or a link to the AI copilot for personalised advice.
- **Monthly reset:** Implement a scheduled Trigger.dev job that runs at the beginning of each calendar month. It should reset the month’s consumed budget counters and, if necessary, archive the previous month’s data. Alternatively, recalculate monthly totals on the fly by filtering activities by date.
- **Insights (optional):** Provide a panel breaking down budget consumption by category. Highlight the category contributing most to over budget status and link to the activity log for more details.

## Check When Done

- Users can set and update their monthly carbon budget via a settings UI.
- The dashboard displays a budget progress indicator coloured appropriately (green/yellow/red) and shows remaining budget and monthly totals.
- A warning appears when the user exceeds their budget, with suggestions or a link to the AI copilot.
- A scheduled job resets the budget consumption at the start of each month or the system recomputes monthly totals on the fly.
- Optional insights show category breakdowns and identify the largest contributors to budget overages.
