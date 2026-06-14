# Carbon Compass AI Design System

This file is the visual source of truth for the Carbon Compass AI MVP.

The app should feel like a premium climate-tech SaaS dashboard: clean, calm, practical, data-driven, and modern. It should not feel childish, gamified in a loud way, or visually inconsistent.

---

## 1. Product Visual Direction

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

---

## 2. Typography

Use one primary font family throughout the app.

Preferred:

```txt
Inter, Geist, SF Pro, or existing app sans-serif font
```

Do not mix in monospace fonts for normal UI text.

### Font Family Rules

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

For numeric dashboard values, use:

```txt
tabular-nums
```

not `font-mono`.

---

## 3. Type Scale

Use this consistent scale:

### Page Title

```txt
text-2xl md:text-3xl
font-bold
tracking-tight
text-text-primary
```

Used for:

* Dashboard
* Log Activity
* AI Copilot
* Simulator
* Insights
* Challenges
* Profile
* Settings
* Budget

### Page Subtitle

```txt
text-xs md:text-sm
text-text-secondary
mt-1
```

### Card Title

```txt
text-base
font-semibold or font-bold
text-text-primary
```

Compact cards may use:

```txt
text-sm font-bold
```

### Card Description

```txt
text-xs
text-text-secondary
```

### Section Labels / Form Labels

```txt
text-xs
font-bold
uppercase
tracking-wider
text-text-secondary
```

Do not use text smaller than `text-xs` for important form labels.

### Body Text

```txt
text-sm
text-text-secondary
leading-relaxed
```

For compact helper text:

```txt
text-xs
text-text-secondary
leading-normal
```

### Buttons

Primary buttons:

```txt
text-sm font-semibold or font-bold
```

Compact buttons:

```txt
text-xs font-semibold
```

Use compact buttons only inside dense dashboard cards.

### Badges

```txt
text-xs
font-semibold or font-bold
rounded-full or rounded-md
```

Very small text such as `text-[9px]` or `text-[10px]` should be avoided unless used for tiny metadata only.

---

## 4. Color Palette

Use the existing app tokens. Do not introduce random colors.

### Core Colors

Background:

```txt
bg-bg-base
#F5F7FA or equivalent
```

Surface/Card:

```txt
bg-bg-surface
#FFFFFF
```

Elevated Surface:

```txt
bg-bg-elevated
#F0F4F8 or equivalent
```

Primary Text:

```txt
text-text-primary
#111827
```

Secondary Text:

```txt
text-text-secondary
#4B5563
```

Muted Text:

```txt
text-text-muted
#6B7280
```

Border:

```txt
border-border-default
border-border-subtle
```

Primary Accent:

```txt
accent-primary
emerald / #10B981
```

Primary Soft Accent:

```txt
bg-accent-primary-dim
emerald tint
```

Success:

```txt
emerald / green
```

Warning:

```txt
amber
```

Error:

```txt
red
```

AI Accent:

AI-specific purple/indigo may be used only when intentionally needed, but Carbon Compass brand icons and Copilot icons should generally use primary emerald unless otherwise specified.

---

## 5. Spacing System

Use an 8px-based spacing rhythm.

Common page wrapper:

```tsx
className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 pb-6 max-md:pb-20"
```

For pages without mobile bottom nav:

```tsx
className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 pb-6"
```

Standard gaps:

```txt
Page sections: gap-6
Card grid gap: gap-6
Compact grid gap: gap-4
Form field gap: gap-4 or gap-5
Card internal spacing: p-4 or p-6
Compact card spacing: p-4
```

Bottom page padding must be consistent:

```txt
desktop bottom padding: 24px / pb-6
mobile bottom padding if bottom nav exists: max-md:pb-20
```

Avoid:

```txt
pb-24 on desktop
pb-10 randomly
pb-1 as only bottom spacing
no bottom padding
```

---

## 6. Cards

Standard card style:

```txt
rounded-xl or rounded-2xl
bg-bg-surface
border border-border-default/60
shadow-sm or shadow-md
```

Cards should not have clipped shadows.

If a card needs internal clipping, use:

```tsx
<div className="rounded-2xl shadow-sm">
  <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-bg-surface">
    ...
  </div>
</div>
```

Avoid placing card shadows inside parents with `overflow-hidden` unless padding is added.

---

## 7. Forms

Form fields should use consistent sizing.

Recommended input/select/textarea style:

```txt
w-full
rounded-xl
border border-border-default
bg-bg-base
px-4
py-2.5
text-sm
text-text-primary
transition-colors
focus-visible:outline-none
focus-visible:border-accent-primary
focus-visible:ring-2
focus-visible:ring-accent-primary/25
focus-visible:ring-offset-1
focus-visible:ring-offset-bg-surface
```

Labels:

```txt
text-xs font-bold uppercase tracking-wider text-text-secondary
```

Focus rings must not be clipped.

Avoid internal scrollbars inside form cards on normal desktop viewports.

---

## 8. Tables

Tables should use the app sans font.

Do not use `font-mono` for table numbers.

Use:

```txt
tabular-nums
```

for numeric alignment.

Table headers:

```txt
text-xs uppercase tracking-wider font-semibold text-text-secondary
```

Table body:

```txt
text-sm text-text-primary
```

---

## 9. Charts

Charts should use consistent app colors:

* Transport: blue
* Food: emerald
* Energy: amber/yellow
* Shopping: purple
* Waste: red

Chart text should use muted text colors and remain readable.

Chart labels must not be clipped.

Use proper margins and axis widths instead of letting labels overflow.

---

## 10. Toasts, Alerts, and Success Messages

Success messages should be:

```txt
rounded-xl
border border-emerald-500/20
bg-emerald-500/10
text-emerald-700
```

They should use readable `text-sm`.

On Log Activity:

* success message appears inside the form card
* directly below the card header/divider
* above input labels
* buttons disappear while the message is visible
* inputs remain visible

---

## 11. Navigation

Sidebar items should remain consistent:

```txt
text-sm or compact equivalent
icon + label
active state uses emerald tint
```

Do not change sidebar spacing or icons unless broken.

---

## 12. MVP Design Consistency Rules

Before committing, verify:

* no random font sizes
* no mixed font families
* no `font-mono` for regular tables
* no clipped focus rings
* no clipped card shadows
* no page with missing bottom padding
* no internal card scrollbar unless absolutely necessary
* no random color changes
* no inconsistent primary button sizing
