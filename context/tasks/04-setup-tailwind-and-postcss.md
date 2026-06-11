# Configure Tailwind and PostCSS

## Goal

Finalize Tailwind CSS and PostCSS configuration to ensure the styling engine works seamlessly with our design system and theme tokens. This includes creating configuration files, importing global styles, and integrating Tailwind into the development workflow.

## Implementation

1. **Initialize Tailwind:** If not already done by `create-next-app`, generate the Tailwind and PostCSS config files:

   ```bash
   npx tailwindcss init -p
   ```

   This creates `tailwind.config.ts` and `postcss.config.js`. Ensure these files exist in the project root.

2. **Tailwind Configuration:**
   - Set the `content` property to include all relevant file paths: `./app/**/*.{js,ts,jsx,tsx}`, `./pages/**/*.{js,ts,jsx,tsx}`, `./components/**/*.{js,ts,jsx,tsx}`. This tells Tailwind to purge unused styles in production.
   - Extend the theme using the tokens defined in your global theme file (see Task 02). Import your tokens if needed or replicate values directly.
   - Add any required plugins such as `@tailwindcss/typography` for prose styling and `@tailwindcss/forms` for better form styling.
   - Configure the `darkMode` option to `'class'` to enable dark mode via a CSS class on the `<html>` element.

3. **PostCSS Configuration:**
   - Ensure `postcss.config.js` includes Tailwind CSS and Autoprefixer:

     ```js
     module.exports = {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```

4. **Import Global Styles:**
   - Create `app/globals.css` (or modify if it exists) and import the Tailwind base, components, and utilities at the top of the file:

     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;

     /* Custom global styles */
     html,
     body {
       @apply bg-background text-foreground;
     }
     ```

   - Reference CSS variables defined in Task 02 by adding them to the `:root` selector.

5. **Configure CSS Imports in Next.js:** Ensure the global CSS file is imported in the custom `RootLayout` component (e.g., `app/layout.tsx` or `pages/_app.tsx` depending on the Next.js version). Example:

   ```tsx
   import '../app/globals.css';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body>{children}</body>
       </html>
     );
   }
   ```

6. **Test Tailwind Setup:** Create a simple test page and apply various classes, including custom theme classes (e.g., `bg-primary`, `text-secondary`, `space-y-4`). Verify styles compile in development and production builds.

## Check When Done

- `tailwind.config.ts` and `postcss.config.js` are present and configured with the correct content paths and plugins.
- The global CSS file imports Tailwind directives and references the custom CSS variables.
- Running `npm run build` produces compiled CSS with your custom styles and no errors.
- Example components render correctly with Tailwind classes and theme tokens across light and dark modes.
