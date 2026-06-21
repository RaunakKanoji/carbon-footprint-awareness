# Deprecated Design Style Guide (Original Configuration Backup)

This document contains a backup of the original Carbon Compass AI premium SaaS design guidelines and CSS variable theme tokens prior to the design system revamp.

## 1. Original CSS Custom Properties (:root)

```css
:root {
  --font-inter:
    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-fira-code:
    'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  --bg-base: #f5f7fa;
  --bg-surface: #ffffff;
  --bg-elevated: #f0f4f8;
  --bg-subtle: #e5eaef;
  --border-default: #d0d7de;
  --border-subtle: #e5eaef;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --text-faint: #9ca3af;
  --accent-primary: #10b981;
  --accent-primary-dim: rgba(16, 185, 129, 0.12);
  --accent-ai: #6366f1;
  --accent-ai-text: #7c83f8;
  --state-error: #dc2626;
  --state-success: #059669;
  --state-warning: #d97706;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Shadcn mappings to tokens */
  --background: var(--bg-base);
  --foreground: var(--text-primary);
  --card: var(--bg-surface);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-surface);
  --popover-foreground: var(--text-primary);
  --primary: var(--accent-primary);
  --primary-foreground: #ffffff;
  --secondary: var(--bg-elevated);
  --secondary-foreground: var(--text-secondary);
  --muted: var(--bg-subtle);
  --muted-foreground: var(--text-muted);
  --accent: var(--bg-subtle);
  --accent-foreground: var(--text-primary);
  --destructive: var(--state-error);
  --destructive-foreground: #ffffff;
  --border: var(--border-default);
  --input: var(--border-default);
  --ring: var(--accent-primary);

  /* Charts */
  --chart-1: #059669;
  --chart-2: #6366f1;
  --chart-3: #10b981;
  --chart-4: #fbbf24;
  --chart-5: #6b7280;

  --radius: 0.5rem;
}
```

## 2. Original Design Guidelines (from design.md)

### 2.1 Product Visual Direction
Carbon Compass AI should feel like a mix of:
- modern SaaS dashboard
- personal finance dashboard
- fitness tracker
- climate-tech product
- AI-assisted productivity tool

The UI should be:
- clean
- premium
- readable
- soft
- spacious but not empty
- consistent across pages
- emerald-accented
- light-theme first

Avoid:
- childish game UI
- loud colors
- excessive gradients
- inconsistent typography
- random font sizes
- random icon colors
- oversized cards
- cramped forms
- internal scrollbars inside cards unless absolutely necessary

### 2.2 Typography
Use one primary font family throughout the app.
Preferred: `Inter, Geist, SF Pro, or existing app sans-serif font`
Do not mix in monospace fonts for normal UI text.

Use app default sans font for:
* headings
* body text
* tables
* buttons
* form labels
* input values
* chart labels
* badges
* navigation
* cards

Avoid `font-mono` unless displaying code or technical debug values.
For numeric dashboard values, use: `tabular-nums` not `font-mono`.

### 2.3 Type Scale
Use this consistent scale:
- Page Title: `text-2xl md:text-3xl font-bold tracking-tight text-text-primary`
- Page Subtitle: `text-xs md:text-sm text-text-secondary mt-1`
- Card Title: `text-base font-semibold or font-bold text-text-primary` (Compact cards: `text-sm font-bold`)
- Card Description: `text-xs text-text-secondary`
- Section Labels / Form Labels: `text-xs font-bold uppercase tracking-wider text-text-secondary` (no smaller than `text-xs`)
- Body Text: `text-sm text-text-secondary leading-relaxed` (Compact helper text: `text-xs text-text-secondary leading-normal`)
- Buttons: Primary: `text-sm font-semibold or font-bold` (Compact: `text-xs font-semibold` inside dense cards)
- Badges: `text-xs font-semibold or font-bold rounded-full or rounded-md`

### 2.4 Color Palette
- Background: `bg-bg-base` (#F5F7FA)
- Surface/Card: `bg-bg-surface` (#FFFFFF)
- Elevated Surface: `bg-bg-elevated` (#F0F4F8)
- Primary Text: `text-text-primary` (#111827)
- Secondary Text: `text-text-secondary` (#4B5563)
- Muted Text: `text-text-muted` (#6B7280)
- Border: `border-border-default` or `border-border-subtle`
- Primary Accent: `accent-primary` (emerald / #10B981)
- Primary Soft Accent: `bg-accent-primary-dim` (emerald tint)
- Success: emerald / green
- Warning: amber
- Error: red

### 2.5 Spacing System
8px-based spacing rhythm.
Common page wrapper:
`className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 pb-6 max-md:pb-20"`
Standard gaps:
- Page sections: gap-6
- Card grid gap: gap-6
- Compact grid gap: gap-4
- Form field gap: gap-4 or gap-5
- Card internal spacing: p-4 or p-6
- Compact card spacing: p-4

### 2.6 Cards
Standard card style:
`rounded-xl or rounded-2xl bg-bg-surface border border-border-default/60 shadow-sm or shadow-md`

### 2.7 Forms
Recommended input/select/textarea style:
`w-full rounded-xl border border-border-default bg-bg-base px-4 py-2.5 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/25 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface`

Labels:
`text-xs font-bold uppercase tracking-wider text-text-secondary`

### 2.8 Tables
Table headers: `text-xs uppercase tracking-wider font-semibold text-text-secondary`
Table body: `text-sm text-text-primary`
Use `tabular-nums` for numeric alignment.

### 2.9 Charts
Colors:
* Transport: blue
* Food: emerald
* Energy: amber/yellow
* Shopping: purple
* Waste: red

### 2.10 Toasts, Alerts, and Success Messages
Success messages:
`rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 text-sm`
Inside form cards, placed directly below the card header/divider, above input labels.
Input remains visible while buttons disappear when success message is shown.

### 2.11 Navigation
Sidebar navigation:
`text-sm or compact equivalent icon + label, active state uses emerald tint`
