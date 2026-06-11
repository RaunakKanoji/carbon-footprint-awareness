# Lifestyle Change Simulator

Read `AGENTS.md` and the `context/project-overview.md` before implementing this feature.

## Goal

Allow users to explore hypothetical changes in their lifestyle and see how those changes could reduce their monthly carbon footprint. Provide ready made scenarios, calculate projected footprints and enable users to adopt a scenario if desired.

## Implementation

- **Scenario definitions:** Create `data/scenarios.ts` containing an array of scenario objects with fields `id`, `name`, `description` and `modifications`. Each `modifications` object specifies changes to the user profile (such as commute mode, distance multipliers, diet frequency or electricity usage multipliers). Define a `ProfileModification` type that mirrors the fields used in the carbon engine.
- **Simulator page:** Build a page that lists all available scenarios. Display each scenario’s name, description and an estimated reduction percentage (either computed on the fly or precomputed). Let users click a scenario to view details and run a simulation.
- **Simulation logic:** When a user selects a scenario:
  - Clone the current user profile and apply the modifications specified in the scenario.
  - Use the carbon engine to calculate the projected monthly emissions for the modified profile.
  - Compare the projected emissions with the user’s actual monthly emissions and calculate the percentage reduction.
- **Result display:** Present the projected footprint, absolute reduction and percentage reduction. Display differences by category using a bar chart or table. Use Recharts for the visualisation.
- **Scenario adoption:** Provide an option for users to adopt the scenario. If adopted, update the user’s profile to reflect the new values or set a recurring reminder. Confirm with the user before saving changes.
- **History (optional):** Optionally implement a `Simulation` model and persist each simulation run. Store the scenario ID, projected emissions and a timestamp so users can review past simulations.

## Check When Done

- Scenarios are defined in `data/scenarios.ts` with an interface that includes id, name, description and modifications.
- The simulator page lists the scenarios with names and descriptions and displays an estimated reduction.
- Selecting a scenario clones the user profile, applies the modifications and calculates the projected monthly footprint using the carbon engine.
- The result view shows the projected footprint, reduction amount and percentage, and breaks down the differences by category with a chart.
- Users can adopt a scenario to update their profile or set a reminder (optional in MVP).
