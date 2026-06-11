# Configure Icons and Assets

## Goal

Set up a unified icon system using Font Awesome, ensuring icons are readily available across the project and encapsulated within a reusable component. This task also includes configuring the Next.js asset pipeline for static images and icons.

## Implementation

1. **Install Icon Packages:** Confirm that `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, and `@fortawesome/react-fontawesome` are installed (installed in Task 03). If not, install them now.

2. **Create an Icon Library:** Create a file `src/lib/icons.ts` to centralize imported icons and add them to the Font Awesome library:

   ```ts
   // src/lib/icons.ts
   import { library } from '@fortawesome/fontawesome-svg-core';
   import {
     faBicycle,
     faBolt,
     faBus,
     faCar,
     faChartPie,
     faCouch,
     faLeaf,
     faPersonRunning,
     faShoppingBag,
     faTrash,
     faTree,
     faUser,
     faUtensils,
   } from '@fortawesome/free-solid-svg-icons';

   // Add icons to the library
   library.add(
     faCar,
     faBus,
     faBicycle,
     faUtensils,
     faBolt,
     faShoppingBag,
     faTrash,
     faChartPie,
     faLeaf,
     faPersonRunning,
     faTree,
     faUser,
     faCouch,
   );

   export {};
   ```

   Import additional icons as needed for new features (e.g., messaging icons for the AI copilot, badge icons for achievements).

3. **Create a Generic Icon Component:** Build a simple wrapper around `FontAwesomeIcon` to enforce consistent sizing and color usage:

   ```tsx
   // src/components/Icon.tsx
   import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

   import { cn } from '@/lib/utils';

   interface IconProps extends FontAwesomeIconProps {
     className?: string;
   }

   export default function Icon({ className, ...props }: IconProps) {
     return <FontAwesomeIcon className={cn('text-primary', className)} {...props} />;
   }
   ```

   This wrapper applies a default color via `text-primary` and merges any additional class names via a utility function `cn` (see Task 01). Extend this as needed to handle size props, hover states, or animations.

4. **Configure Static Assets:** Ensure that Next.js can serve static images and icons by placing them under the `public` directory (e.g., `public/images`). Use the built-in `<Image>` component from `next/image` to optimize image delivery. Document asset usage in `ui-context.md`.

5. **Test Icons:** Create a test component or page that renders each imported icon using the `Icon` component. Verify that icons appear consistently across different sizes and colors. Confirm there are no flashes of unstyled icons (FOUC) when switching pages.

## Check When Done

- `src/lib/icons.ts` adds all required icons to the Font Awesome library without duplications.
- `Icon.tsx` encapsulates `FontAwesomeIcon` and applies default styling using theme tokens.
- Icons render properly in a sample page with consistent sizing and color.
- Static assets (images, icons) reside in the `public` directory and are referenced via `<Image>` from `next/image` when appropriate.
