# Activity Logging

Read `AGENTS.md` and the `context/project-overview.md` before implementing this feature.

## Goal

Enable users to record their daily activities across all emission categories. Each log should update the user’s carbon footprint, persist to the database and allow for editing or deletion. Validation must enforce sensible input ranges and categories.

## Implementation

- **Prisma model:** Add an `Activity` model and an `ActivityCategory` enum to the Prisma schema. Each record includes `userId`, `category`, `type`, `quantity`, `unit`, `emissionFactor`, `co2e` and `timestamp`. Define the relation back to the `User` model.
- **API routes:** Implement REST endpoints or server actions under `/api/activities`:
  - `POST /api/activities` to create a new activity. Validate inputs, compute CO₂e via the carbon engine and persist the record.
  - `GET /api/activities` to fetch activities for the current user. Support optional query parameters for date range or category filtering.
  - `PATCH /api/activities/:id` to update an existing log. Recalculate the CO₂e if quantity or type changes.
  - `DELETE /api/activities/:id` to remove a log.
- **Client forms:** Build category specific logging components:
  - **Transport:** dropdown for mode, numeric input for distance and optional passengers field.
  - **Electricity:** numeric input for kWh consumed.
  - **Food:** dropdown for meal type, numeric input for servings.
  - **Shopping:** dropdown for product type, numeric input for quantity.
  - **Waste:** dropdown for waste type, numeric input for weight and toggles for recycling/composting.
  - **Flight:** numeric input for distance and dropdown for cabin class.
    Each component should call the appropriate API endpoint and update the state via SWR or React query.
- **Optimistic updates:** Update dashboard state optimistically on the client when a new activity is submitted. Roll back changes on failure.
- **Edit & delete:** Provide an activity history list where users can edit or delete existing logs. Editing a log should trigger recalculation of CO₂e. Deleting should update the totals.
- **Validation:** Use Zod schemas to validate that quantities are positive numbers and that types belong to the defined enums. Return errors to the client on invalid input.

## Check When Done

- The Prisma schema contains an `Activity` model and `ActivityCategory` enum with correct fields and relations.
- REST endpoints exist for create, list, update and delete operations. They validate input and enforce authentication and ownership.
- Client forms for each category submit new logs and display validation errors.
- Dashboard totals update immediately after logging, and changes are rolled back if the API call fails.
- Users can edit or delete logs from the activity history, and the recalculated totals reflect those changes.
