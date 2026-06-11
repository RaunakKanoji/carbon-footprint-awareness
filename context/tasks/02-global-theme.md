# Global Theme Configuration

## Goal

Establish a consistent global theme across the entire project by configuring Tailwind CSS’s theme extension and setting up a design token file. This ensures colors, spacing, typography, and responsive breakpoints remain uniform throughout the application.

## Implementation

1. **Review UI Guidelines:** Read `ui-context.md` and `project-overview.md` to understand the desired look and feel. Note primary/secondary colors, font families, and sizing conventions.
2. **Configure Tailwind Theme:** In `tailwind.config.ts`, extend the default theme by adding the following:
   - Custom color palette derived from the design system (e.g., `primary`, `secondary`, `accent`, `background`, `foreground`).
   - Typography settings for headings, body, and captions using the fonts defined in `ui-context.md`.
   - Spacing scale consistent with our design (e.g., incrementing by 4px values).
   - Breakpoints for mobile, tablet, and desktop.
3. **Create a Design Token Module:** Add a file at `src/styles/theme.ts` that exports type‑safe variables for colors, fonts, spacing, and other tokens. Example:

   ```ts
   // src/styles/theme.ts
   export const theme = {
     colors: {
       primary: 'var(--color-primary)',
       secondary: 'var(--color-secondary)',
       background: 'var(--color-background)',
       // ...others
     },
     font: {
       sans: 'Inter, sans-serif',
       // ...others
     },
     spacing: {
       xs: '0.25rem',
       sm: '0.5rem',
       md: '1rem',
       lg: '1.5rem',
       xl: '2rem',
     },
   } as const;
   ```

4. **Define CSS Variables:** In `globals.css` or a base stylesheet, define CSS custom properties for each color and spacing token, referencing the Tailwind configuration to maintain consistency. This allows dynamic theming in the future.
5. **Integrate Theme into Components:** Use the exported `theme` values rather than hard‑coding colors or spacing in components. When using shadcn/ui components, override their props with your theme tokens for brand consistency.
6. **Test Responsiveness:** Create simple sample components (e.g., a card, button, and form) using the new theme to verify proper color and spacing usage across breakpoints.

## Check When Done

- Ensure `tailwind.config.ts` contains your custom theme extensions and that the design tokens align with `ui-context.md` guidelines.
- `src/styles/theme.ts` exports all necessary tokens and is used in at least one component.
- A sample page demonstrates your theme with primary, secondary, and neutral sections on mobile, tablet, and desktop sizes.
- Confirm that no arbitrary hex codes or spacing values are used directly in components; all should reference the theme tokens.
