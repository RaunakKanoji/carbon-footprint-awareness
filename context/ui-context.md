# UI Context

This document defines the visual language, colour palette, typography and component conventions for Carbon Compass AI. Use it as a reference when building UI components and pages.

## Theme

Carbon Compass AI uses a light theme inspired by sustainability and clarity. A light backdrop paired with neutral surfaces and vibrant accents conveys approachability and hope. There is no dark mode in the MVP.

All colours are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via the `@theme inline` directive. Components must use these tokens rather than hardcoded hex values or raw Tailwind colour classes like `emerald-500`.

| Role             | CSS Variable           | Hex / Value                 |
| ---------------- | ---------------------- | --------------------------- |
| Page background  | `--bg-base`            | `#f5f7fa` (very light grey) |
| Surface          | `--bg-surface`         | `#ffffff` (white)           |
| Elevated surface | `--bg-elevated`        | `#f0f4f8` (light neutral)   |
| Subtle surface   | `--bg-subtle`          | `#e5eaef` (lighter neutral) |
| Default border   | `--border-default`     | `#d0d7de` (grey)            |
| Subtle border    | `--border-subtle`      | `#e5eaef` (very light grey) |
| Primary text     | `--text-primary`       | `#111827` (dark slate)      |
| Secondary text   | `--text-secondary`     | `#4b5563` (slate)           |
| Muted text       | `--text-muted`         | `#6b7280` (grey)            |
| Faint text       | `--text-faint`         | `#9ca3af` (light grey)      |
| Brand accent     | `--accent-primary`     | `#10b981` (emerald green)   |
| Brand dim        | `--accent-primary-dim` | `rgba(16,185,129,0.12)`     |
| AI accent        | `--accent-ai`          | `#6366f1` (indigo)          |
| AI text          | `--accent-ai-text`     | `#7c83f8` (light indigo)    |
| Error            | `--state-error`        | `#dc2626` (red)             |
| Success          | `--state-success`      | `#059669` (green)           |
| Warning          | `--state-warning`      | `#d97706` (orange)          |

Tailwind utility names map to these variables. For example: use `bg-base`, `bg-surface`, `text-primary`, `text-muted`, `border-default`, `text-accent-primary`, `bg-accent-primary-dim`.

## Typography

| Role      | Font      | CSS Variable       |
| --------- | --------- | ------------------ |
| UI text   | Inter     | `--font-inter`     |
| Code/mono | Fira Code | `--font-fira-code` |

Load fonts via `next/font/google` and apply them as CSS variables on the `<html>` element. The base `body` uses Inter with `antialiased`.

Body copy size defaults to `text-base` with a comfortable line height (`leading-relaxed`). Headings use `font-semibold` with appropriate spacing; avoid exceedingly large font sizes.

## Border Radius

Border radius increases with surface depth to create a sense of hierarchy. Use the following classes consistently:

| Context           | Class         |
| ----------------- | ------------- |
| Inputs / buttons  | `rounded-lg`  |
| Cards / panels    | `rounded-xl`  |
| Modals / overlays | `rounded-2xl` |

## Charts

Charts are rendered on the client using Recharts. Use a consistent set of colours for segments and bars that coordinate with the palette above. For example:

- Transport: `#059669` (success green)
- Electricity: `#6366f1` (indigo)
- Food: `#10b981` (emerald)
- Shopping: `#fbbf24` (amber)
- Waste: `#6b7280` (grey)
- Flights: `#ef4444` (red)

Avoid 3D effects or drop shadows; charts should be clean and flat. Provide tooltips with precise values on hover and accessible labels for screen readers.

## Layout Patterns

- **Dashboard:** Use a responsive grid layout. Summary cards sit at the top; below them, allocate horizontal space for the pie chart and trend chart. A side panel can display recommendations and budget progress.
- **Forms:** Group related form fields together in cards with clear headings. Use horizontal space on larger screens and stack fields on narrow screens. Provide inline validation messages.
- **Chat Interface:** The AI copilot lives in a slide out panel or a full width section. Messages are displayed in bubbles with alternating alignment (user on the right, assistant on the left). Use `rounded-xl` for bubbles.
- **Simulator:** Present scenarios in a list or card grid. The result comparison can be displayed in a panel or modal with textual and graphical summaries.
- **Navigation:** Include a top navigation bar with the app name and a user avatar/menu. Use sticky positioning to keep it visible. For mobile, collapse navigation into a hamburger menu.

## Component Library

Use shadcn/ui components as the foundation. Avoid custom design systems; instead compose shadcn primitives with Tailwind classes and the colour tokens defined above. Use the `shadcn` CLI to add new components such as `Button`, `Card`, `Dialog`, `Input`, `Tabs` and `Tooltip`.

## Icons & Assets

### Unified Icon System

We use a unified icon system based on Font Awesome Solid icons, centralizing icon imports in `src/lib/icons.ts` to prevent duplication and prevent FOUC (Flash of Unstyled Content) by disabling Font Awesome's dynamic CSS injection in favour of loading its stylesheet globally.

A generic wrapper component is provided at [Icon.tsx](file:///Users/admin/Code/carbon-footprint-awareness/src/components/Icon.tsx) (`@/src/components/Icon`). It encapsulates the raw `FontAwesomeIcon` and automatically applies the `text-text-primary` class unless overridden.

#### Sizing Conventions

Use size presets from Font Awesome (e.g. `size="sm"`, `size="lg"`, `size="2x"`, `size="3x"`) or control layout dimensions using Tailwind sizing constraints via `className` (e.g. `h-4 w-4` for small inline layout alignments).

- **Inline layout / small badges:** `size="sm"` or `className="h-4 w-4"`
- **Standard button icons / alerts:** `size="lg"` or `className="h-5 w-5"`
- **Section headers / highlights:** `size="2x"` or `className="h-8 w-8"`
- **Large Empty states / success illustrations:** `size="3x"` or `className="h-12 w-12"`

#### Registered Icons

Always check [icons.ts](file:///Users/admin/Code/carbon-footprint-awareness/src/lib/icons.ts) before adding an icon. Current registered icons include:

- `car` (Transport - personal vehicle)
- `bus` (Transport - public transit)
- `bicycle` (Transport - active travel)
- `utensils` (Food - meals and diet)
- `bolt` (Energy - electricity and power)
- `shopping-bag` (Consumption - merchandise/shopping)
- `trash` (Waste - disposal and recycle footprint)
- `chart-pie` (Analytics - reporting breakdowns)
- `leaf` (Eco - sustainability and eco friendliness)
- `person-running` (Eco - health and low carbon activities)
- `tree` (Eco - carbon offsets & sequestration)
- `user` (Profile - accounts and settings)
- `couch` (Energy - home layout and comfort footprint)

To add new icons, import them from `@fortawesome/free-solid-svg-icons` in `src/lib/icons.ts` and add them to `library.add(...)`.

### Static Assets & Next.js Image Optimization

All static assets (photographs, custom vector illustrations, and brand SVG assets) must be placed in the `public` directory (typically organized under `public/images/`).

Always use the built-in Next.js `<Image>` component from `next/image` to optimize image delivery automatically (delivering modern formats like WebP, sizing responsively, and lazy loading offscreen images). Example:

```tsx
import Image from 'next/image';

export default function CarbonBanner() {
  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden">
      <Image
        src="/images/forest-offset.jpg"
        alt="Forest Carbon Offsetting"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
```
