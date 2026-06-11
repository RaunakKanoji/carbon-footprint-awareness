# Build Lifestyle Change Simulator

## Goal

Develop a tool that allows users to experiment with hypothetical lifestyle changes and see how they would impact their carbon footprint. The simulator should show potential CO₂e reductions for specific actions, empowering users to make informed decisions.

## Implementation

1. **Design Simulator UI:** Create a page at `app/simulator/page.tsx`. Use tabs or a form with multiple sections for each type of change (e.g., transport, diet, energy). Each section should allow the user to adjust parameters and immediately see the estimated impact.

2. **Simulator Scenarios:** Define a set of scenarios the user can adjust. Examples:
   - **Transport:** Reduce car trips per week, switch to public transport, increase carpooling.
   - **Food:** Replace meat meals with plant‑based meals a few times per week.
   - **Energy:** Decrease AC usage hours or switch to solar.
   - **Shopping:** Delay purchasing new electronics or choose second‑hand goods.
   - **Waste:** Increase recycling or start composting.

3. **Calculate Simulated Impact:** Use the carbon engine (Task 14) to compute the baseline emissions (current month) and the projected emissions after applying changes. Steps:
   - Fetch the user’s historical activity data for the current period (e.g., last 30 days).
   - Apply the hypothetical reduction factors to the relevant quantities (e.g., reduce car distance by 50%).
   - Compute new CO₂e totals and compare to the baseline.
   - Display the difference as “Potential savings” in both absolute kg and percentage terms.

4. **Visualization:** Use charts (Recharts) or gauges to display the before and after. For example, a horizontal bar comparing current vs. simulated emissions for each category.

5. **Encourage Action:** After simulation, provide a button to commit to the changes. Clicking “Commit” could prefill a new Challenge (see Task 23) or set a personal goal. This can be implemented in later tasks.

6. **Data Persistence:** Do not persist simulated values until the user commits. Simulations should be client-side or server-side computations that do not modify the database by default.

## Check When Done

- The simulator page allows users to modify lifestyle parameters and instantly see updated carbon footprints.
- Simulated CO₂e savings are calculated accurately using the carbon engine functions.
- Charts clearly illustrate the difference between current and simulated emissions.
- Users can experiment with multiple scenarios without altering their actual data.
- The simulator encourages users to commit to changes, connecting with future features such as challenges or goals.
