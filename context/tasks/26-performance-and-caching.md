# Optimize Performance and Implement Caching

## Goal

Ensure the application remains performant by minimizing database calls, leveraging caching where appropriate, and optimizing rendering. This improves user experience, especially for data-heavy pages like the dashboard and simulator.

## Implementation

1. **Database Query Optimization:**
   - Use Prisma’s `select` and `include` options to fetch only the fields needed by the client.
   - Batch queries when fetching multiple datasets (e.g., weekly sums, monthly sums, budgets) rather than making separate calls.
   - Create indexes on frequently filtered columns (e.g., `userId`, `createdAt` in `ActivityLog`) to speed up queries.

2. **Client-Side Caching:**
   - Integrate React Query (`@tanstack/react-query`) to cache API responses on the client. Configure sensible stale times (e.g., 1 minute for dashboard metrics) and revalidation intervals.
   - Use query keys based on user ID and date range to cache results separately.
   - Provide optimistic UI updates when logging activities and updating budgets.

3. **Server-Side Caching:**
   - Implement in-memory caching for emission factors or static reference data (see Task 14). Use a Map or LRU cache library.
   - Consider using a shared cache (Redis) if scaling to multiple instances.

4. **Static Generation & Incremental Static Regeneration (ISR):**
   - Use Next.js ISR for pages that do not change per user (e.g., landing page or public documentation). Set appropriate revalidate intervals.
   - For per-user pages like the dashboard, rely on server components and caching via React Query rather than ISR.

5. **Memoization:**
   - Use `useMemo` in React to prevent recalculations of expensive computations (e.g., chart data transformation) when dependencies haven’t changed.

6. **Lazy Loading & Code Splitting:**
   - Lazy load heavy components like charts or the simulator using `dynamic` imports. This reduces the initial page bundle size.
   - Split code into smaller chunks and ensure only necessary JavaScript is delivered to the client on each page.

7. **Performance Monitoring:**
   - Use the browser’s performance tab or tools like Lighthouse to measure metrics such as LCP (Largest Contentful Paint) and TBT (Total Blocking Time).
   - Identify bottlenecks and optimize accordingly.

## Check When Done

- API queries fetch minimal required data and are batched when possible.
- React Query caches API responses with sensible stale and cache times.
- Emission factors and other static data are cached in memory, reducing database load.
- Page load times are optimized through code splitting, lazy loading, and memoization.
- Performance metrics improve compared to an uncached baseline, and findings are documented in `progress-tracker.md`.
