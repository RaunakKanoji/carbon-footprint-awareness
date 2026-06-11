# Implement Activity Logging Forms

## Goal

Enable users to log their daily activities across different categories using intuitive forms. These forms collect inputs such as distance travelled, meals consumed, electricity used, items purchased, and waste generated, and then send the data to the server for carbon calculation and storage.

## Implementation

1. **Create Activity Logging Page:** Set up a route at `app/log/page.tsx` that serves as the central location for logging new activities. Use `SignedIn` to ensure only authenticated users can access it.

2. **Build Category Tabs or Accordion:** Use shadcn/ui’s `Tabs` or `Accordion` components to separate forms for Transport, Food, Energy, Shopping, and Waste. This helps users focus on one category at a time.

3. **Design Forms for Each Category:**
   - **Transport Form:**
     - Select field for transport subtype (car, bus, metro, etc.) using options from `ActivitySubTypes[Transport]`.
     - Number input for distance in kilometres.
     - Optional field for number of passengers (to account for carpooling).
   - **Food Form:**
     - Select field for meal type (vegan, vegetarian, chicken, etc.).
     - Number input for quantity of meals.
   - **Energy Form:**
     - Number input for electricity usage in kWh.
     - Optional selection for energy source (grid vs. solar) if the user uses alternative energy.
   - **Shopping Form:**
     - Select field for product type (t‑shirt, jeans, smartphone, etc.).
     - Number input for quantity purchased.
   - **Waste Form:**
     - Select field for waste type (general, recycled, food waste).
     - Number input for weight in kilograms.

4. **Validation with Zod:** Define schemas for each form to ensure valid input. Example:

   ```ts
   const transportSchema = z.object({
     subType: z.string(),
     distanceKm: z.number().nonnegative(),
     passengers: z.number().min(1).default(1),
   });
   // Similar schemas for food, energy, shopping, and waste
   ```

5. **Submit Handlers:** For each form, create an `onSubmit` handler that:
   - Validates the input.
   - Calls a server action or API route (to be implemented in Task 17) to record the activity and calculate CO₂e using the carbon engine.
   - Clears the form upon success and displays a confirmation message via a toast.

6. **Reusable Components:** Build shared form components (e.g., `SelectInput`, `NumberInput`) and validation error components to reduce duplication. Store them in `src/components/forms/`.

7. **UX Considerations:**
   - Provide placeholders and helper text to guide user input.
   - Use icons from `CategoryMetaMap` to visually reinforce the category.
   - Consider adding quick actions (e.g., “Log 5 km car ride” as a preset) for commonly repeated activities.

## Check When Done

- `app/log/page.tsx` presents a structured interface for logging activities by category.
- Each form validates input and displays helpful error messages when data is invalid.
- Submissions create new `ActivityLog` records via API and provide immediate feedback to the user.
- The design is responsive and accessible, using shadcn/ui components and theme tokens.
- Document the logging process in `progress-tracker.md` and link to form component documentation in `code-standards.md`.
