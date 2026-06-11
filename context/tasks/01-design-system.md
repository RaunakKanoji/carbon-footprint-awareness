# 01 – Design System and UI Primitives

Read `AGENTS.md` and `context/ui-context.md` before starting this task.

## Goal

Set up the UI foundations for the application by installing the shadcn/ui component library, adding core primitives (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea) and configuring the Lucide icon set. Also create a utility function for merging Tailwind class names.

## Implementation

- **Install dependencies:** Run the shadcn CLI to install the base components. Install `lucide-react` for icons.
- **Add primitives:** Use the shadcn CLI to scaffold the core components (`Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea`). Do not manually edit the generated files.
- **Create util file:** In `lib/utils.ts`, define a `cn(...classes: string[])` helper that merges Tailwind class names. Use this helper in your components.
- **Theme integration:** Ensure all generated components use CSS variables defined in `globals.css` for colours, backgrounds, borders and fonts. Replace any hardcoded colours with the corresponding Tailwind token classes.
- **Icon library:** Install `lucide-react` and use icons only via this package. Do not import SVGs directly from elsewhere.

## Check When Done

- All core shadcn components compile without errors and import correctly.
- The `cn()` helper function exists in `lib/utils.ts` and is used in newly created components where multiple class names are combined.
- The UI reflects the colour palette defined in `context/ui-context.md`, with no stray hardcoded colours.
- `lucide-react` is installed and icons can be imported.
