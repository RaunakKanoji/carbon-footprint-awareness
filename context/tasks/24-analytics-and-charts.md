# Enhance Analytics and Charts

## Goal

Provide deeper insights into users’ carbon footprints through advanced analytics and interactive charts. This includes more detailed breakdowns over time, category comparisons, and trend analysis beyond the basic dashboard metrics.

## Implementation

1. **Define Additional Metrics:** Determine which metrics would offer meaningful insights. Examples:
   - Emissions per category over the last 30/90/365 days.
   - Top contributing subtypes (e.g., petrol car vs. bus).
   - Year-over-year or month-over-month trends.
   - Distribution of activities across weekdays vs. weekends.
   - Correlation between budget adherence and challenge participation.

2. **Extend Data Aggregation:** Write server functions to compute these metrics using Prisma queries. Utilize SQL functions (`date_trunc`, `sum`, `group by`) to aggregate data by time intervals or categories. Expose these via tRPC procedures or API routes.

3. **Implement Interactive Charts:** Use Recharts to create:
   - **Line Charts:** Show emissions over time. Allow the user to switch between daily, weekly, and monthly views. Add tooltips and hover states for detailed values.
   - **Stacked Bar Charts:** Compare categories across multiple months. Use colors from `CategoryMetaMap` to represent each category.
   - **Heatmaps:** Represent activity intensity across days of the week. Consider using a library like `react-calendar-heatmap` for heatmap visualizations.

4. **Filtering and Controls:** Provide UI controls for date range selection, category filtering, and granularity. Use select inputs or date pickers from shadcn/ui. Persist user preferences (e.g., last selected view) in local storage or the database.

5. **Advanced Analysis (Optional):** Implement basic statistical analysis, such as moving averages or percentage change calculations. Display results alongside charts to explain trends (e.g., “You reduced your emissions by 12% compared to last month”).

6. **Accessibility:** Add aria labels and descriptive captions for charts. Provide data tables or textual summaries as alternatives for visually impaired users.

## Check When Done

- Additional analytics metrics are defined and computed via server queries.
- Charts render interactive visualizations that update based on user selections.
- The UI offers filtering controls and remembers user preferences.
- Users gain deeper insights into their habits, enabling more effective behavior change.
- All visualizations adhere to accessibility guidelines and use consistent colors and typography as defined in the global theme.
