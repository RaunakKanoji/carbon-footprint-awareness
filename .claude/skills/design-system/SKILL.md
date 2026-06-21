# Design System — Agent Instructions

This skill describes the visual design language for all UI output. Every component, layout, and page should follow the design specs in the module files below. These describe *what the design looks like* — you choose how to implement the styles.

## Style
A bold, friendly, gamified-learning interface inspired by playful language-learning apps — pure white backgrounds, vivid grass-green brand color, chunky 2px borders, fully rounded soft shapes (12px), bold rounded display typography, and tactile buttons with a flat drop-shadow that gives every action a pressable, physical feel.

## Before Writing Any Code

1. **Read every module that applies.** For a landing page, read at minimum: `layout.md`, `typography.md`, `colors.md`, `buttons.md`, `cards.md`, `shadows.md`, `radius.md`, `borders.md`. Do NOT write JSX until you have loaded all relevant modules.

## Critical Rules

- **Tokens are AGNOSTIC, NOT framework classes:** The tokens defined in the `.md` files (like `neutral-primary-soft`, `heading`, `border-default`) are agnostic design system tokens, NOT literal classes from any specific styling framework. Do not blindly use class names that match these tokens unless you have explicitly mapped them in your styling configuration. You must implement the mapping yourself.

- **Cross-reference modules.** A card containing buttons must satisfy both `cards.md` AND `buttons.md`.
- **Dark mode is automatic.** The CSS custom properties resolve differently in light/dark via `@media (prefers-color-scheme: dark)`. Never manually swap colors.
- **Every interactive element needs hover, focus, and disabled states** — defined in the relevant module.
- **Use semantic HTML:** proper heading hierarchy (`h1`→`h6`), `<button>` for actions, `<a>` for navigation, ARIA attributes where needed.
- **All section backgrounds are pure white** — never tint a section background; use 2px borders to delimit sections instead.
- **All borders for delimiting sections, cards, and inputs are 2px wide.**
- **All elements use a 12px border-radius** unless they are explicitly pills, avatars, or dot indicators (9999px).
- **Buttons use a flat `0 4px 0` drop-shadow** in a darker tone of their variant — no glint or gradient highlight effects.

## Module Index

### Foundation (read first for any UI work)
- [colors.md](colors.md) — all background, text, and border color tokens
- [typography.md](typography.md) — heading scale, paragraphs, labels, links
- [layout.md](layout.md) — spacing rhythm, containers, animation, visual depth
- [radius.md](radius.md) — border-radius scale
- [shadows.md](shadows.md) — elevation tokens
- [borders.md](borders.md) — border widths and styles

### Components
- [buttons.md](buttons.md) — button variants, sizes, states, drop-shadow effect
- [button-group.md](button-group.md) — grouped button structure
- [cards.md](cards.md) — card structure, background, interactivity
- [inputs.md](inputs.md) — form controls, labels, states
- [alerts.md](alerts.md) — alert variants
- [badges.md](badges.md) — badge variants, sizes, dismissible chips
- [lists.md](lists.md) — list components
- [avatars.md](avatars.md) — avatar variants, sizes, indicators
- [icon-shapes.md](icon-shapes.md) — icon containers

### Complex Components
- [accordion.md](accordion.md) — accordion variants
- [dropdown.md](dropdown.md) — dropdown menus
- [modals.md](modals.md) — modal dialogs
- [tabs.md](tabs.md) — tab navigation
- [tables.md](tables.md) — table structure
- [pagination.md](pagination.md) — pagination components
- [sidebars.md](sidebars.md) — sidebar navigation
- [radios-checkboxes-toggle.md](radios-checkboxes-toggle.md) — selection controls
- [tooltips-popovers.md](tooltips-popovers.md) — tooltips and popovers
- [content.md](content.md) — grid system, responsiveness

---

## Source file: `accordion.md`

# Accordion

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** full width, 2px border (border-default color), 12px radius — clips first/last item corners
- **Item separator:** 2px bottom border (border-default) on every item except last

## Trigger (Button)

- **Layout:** flex, space-between, full width
- **Padding:** 20px horizontal, 18px vertical
- **Font:** 16px, bold weight (700)
- **Text color:** heading
- **Background:** neutral-primary-soft (white)
- **Hover:** brand-softer background
- **Focus:** outline none, 2px ring in brand color
- **Transition:** colors, 150ms ease-out
- **Open state:** brand-softer background

## Panel (Content)

- **Padding:** 20px horizontal, 18px vertical
- **Background:** neutral-primary-soft (white)
- **Top border:** 2px, border-default color
- **Font:** 16px, body color, 1.55 line-height

## Chevron Icon

- Size: 18x18px
- Color: body text color
- Closed: 0deg rotation
- Open: 180deg rotation
- Transition: transform, 150ms ease-out

## Variants

### Default (Collapse)
One panel open at a time. Items stacked inside a single shared bordered/rounded wrapper.

### Separated Cards
Each item is independent — has its own 2px border, 12px radius, and shadow-xs (flat 2px offset). 12px bottom margin between items. No shared outer border.

### Always Open
Multiple panels can expand simultaneously. Same styling as Default.

### Flush
No outer border. Trigger and panel have white backgrounds. Only 2px bottom border dividers between items. Use inside containers that already provide a background.

## States

| State | Trigger appearance |
|---|---|
| Closed | heading text, neutral-primary-soft (white) background |
| Open | heading text, brand-softer background |
| Hover | brand-softer background |
| Focus | 2px brand ring, no outline |
| Disabled | fg-disabled text, not-allowed cursor, no hover/focus |

---

## Source file: `alerts.md`

# Alerts

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Padding:** 16px
- **Radius:** 12px (base)
- **Border:** 2px
- **Heading:** 16px, bold weight (700)
- **Body:** 15px, regular weight (400), 1.5 line-height

## Variants

### Brand
- **Background:** brand-softer
- **Border:** 2px, border-brand-subtle
- **Text:** fg-brand-strong

### Success
- **Background:** success-soft
- **Border:** 2px, border-success-subtle
- **Text:** fg-success-strong

### Danger
- **Background:** danger-soft
- **Border:** 2px, border-danger-subtle
- **Text:** fg-danger-strong

### Warning
- **Background:** warning-soft
- **Border:** 2px, border-warning-subtle
- **Text:** fg-warning

---

## Source file: `avatars.md`

# Avatars

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Circular shape:** fully rounded (9999px)
- **Rounded square shape:** 12px radius
- **Default size:** 40x40px
- **Image fit:** cover

## Sizes

| Size | Dimensions | Radius |
|---|---|---|
| Extra Small | 20x20px | 12px |
| Small | 28x28px | 12px |
| Base | 36x36px | 12px |
| Large | 48x48px | 12px |
| XL | 60x60px | 12px |
| 2XL | 72x72px | 12px |

## Bordered Avatar

- 4px padding, fully rounded, 2px outline in border-default color
- Alternative: 2px box-shadow ring in border-default color

## Stacked Avatars

- Displayed in a row (flex)
- Each avatar: 40x40px, fully rounded, 2px border in border-buffer color
- Overlap: -16px negative margin on all except first

### Stacked Counter
- Same size as avatars (40x40px), fully rounded
- Background: brand, text: white, 13px font, bold weight (700)
- Same overlap margin as other avatars

## Avatar with Text

- Flex row, 12px gap between avatar and text
- Avatar: 40x40px, fully rounded, cover fit
- Name: heading color, bold weight (700)
- Subtitle: 14px, body color

---

## Source file: `badges.md`

# Badges

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Border:** 2px
- **Default radius:** 12px
- **Pill radius:** 9999px
- **Font:** bold weight (700), uppercase, 0.6px letter-spacing

## Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Default (small) | 12px | 8px | 4px |
| Large | 14px | 10px | 6px |

## Variants

### Brand
- **Background:** brand-softer
- **Border:** 2px, border-brand-subtle
- **Text:** fg-brand-strong

### Alternative (Neutral Soft)
- **Background:** neutral-primary-soft (white)
- **Border:** 2px, border-default
- **Text:** heading

### Gray (Neutral Medium)
- **Background:** neutral-secondary-medium
- **Border:** 2px, border-default
- **Text:** heading

### Danger
- **Background:** danger-soft
- **Border:** 2px, border-danger-subtle
- **Text:** fg-danger-strong

### Success
- **Background:** success-soft
- **Border:** 2px, border-success-subtle
- **Text:** fg-success-strong

### Warning
- **Background:** warning-soft
- **Border:** 2px, border-warning-subtle
- **Text:** fg-warning

### Dark
- **Background:** dark
- **Border:** transparent
- **Text:** white

## Pill Badges

Use 9999px radius instead of 12px on any variant.

## Badges with Icons

- Icon size (default): 12x12px
- Icon size (large): 14x14px
- Icon spacing: 6px margin next to label

## Icon-only Badge

Square shape — equalize dimensions to 28x28px, no horizontal text padding, 12px radius.

## Dismissible Badges

Badge content + a close button. Close button hover backgrounds per variant:

| Variant | Close button hover background |
|---|---|
| Brand | brand-soft |
| Alternative | neutral-tertiary |
| Gray | neutral-quaternary |
| Danger | danger-medium |
| Success | success-medium |
| Warning | warning-medium |

## Dot / Notification Badge

- Positioned absolutely: -4px top, -4px right
- Size: 14x14px, fully rounded
- 2px border in border-buffer color
- Background: danger

---

## Source file: `borders.md`

# Borders

## Width Scale

| Context | Width |
|---|---|
| Default (inputs, buttons, cards, sections) | 2px |
| Emphasis / focus | 2px |
| Hairline divider (table rows, list separators) | 1px |

## Rules

- Use solid borders by default — they should feel confident and present, not fade into the background
- Dashed borders only for special cases like file dropzones
- Components in the same family must use matching border widths
- Default border width across the system is 2px to match the bold, illustrative reference style
- Never mix 1px and 2px borders within a single component

## Usage

| Context | Width |
|---|---|
| Inputs / selects / textareas | 2px default; 2px brand on focus or 2px danger on error |
| Buttons | 2px for variants that require outlining (secondary, tertiary) |
| Cards / containers | 2px crisp border in border-default |
| Section dividers | 2px in border-default |

---

## Source file: `button-group.md`

# Button Groups

> Dependencies: `buttons.md`, `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** inline-flex, 12px radius, shadow-xs (flat 2px offset)
- **Children overlap:** -2px left margin on all except first button (matches the 2px border width)
- **Buttons inside the group must NOT have individual drop-shadows.** Only the wrapper has a shadow.

## Anatomy

### Wrapper
- Display: inline-flex
- Radius: 12px
- Shadow: shadow-xs

### First Button
- 12px radius on inline-start side only, 0 on inline-end

### Middle Button(s)
- No radius (0 on all corners)

### Last Button
- 12px radius on inline-end side only, 0 on inline-start

### All buttons except first
- -2px left margin to overlap 2px borders cleanly

## Rules

- Buttons inside groups follow all styles from `buttons.md` (background, 2px border, focus rings) except the individual drop-shadow effect
- Icon-only buttons: 18x18px icon, match height of text buttons

---

## Source file: `buttons.md`

# Buttons

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Core Specs (every button except ghost and disabled)

- **Radius:** 12px (base) for all sizes; 9999px only when explicitly used as a pill
- **Border:** 2px solid
- **Drop-shadow effect:** Every button except ghost and disabled gets a flat, offset drop-shadow that sits directly under the button — giving the tactile, "pressable" feel of the reference design:
  - `box-shadow: 0 4px 0 var(--shadow-{variant});`
  - On `:active` / pressed state, the button shifts down 2px and the shadow shrinks to `0 2px 0 var(--shadow-{variant});`
  - On `:hover`, the shadow stays at `0 4px 0` but the background lightens slightly
- **Font weight:** 700 (bold)
- **Font:** din-2014-rounded-variable
- **Text transform:** uppercase
- **Letter-spacing:** 0.8px
- **Box sizing:** border-box
- **Transition:** background-color and transform 100ms ease-out

## Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Extra small | 12px | 14px | 8px |
| Small | 13px | 16px | 10px |
| Base (default) | 15px | 20px | 14px |
| Large | 16px | 28px | 16px |
| Extra large | 17px | 32px | 18px |

## Variants

### Brand
- **Background:** brand token
- **Border:** transparent (or 2px brand-strong if outlined treatment is needed)
- **Text:** white
- **Hover:** brand-medium background
- **Focus ring:** 4px, brand-soft color
- **Drop-shadow:** `0 4px 0 var(--shadow-brand)` (uses brand-strong color)

### Secondary
- **Background:** neutral-primary-soft (white)
- **Border:** 2px, border-default
- **Text:** body color
- **Hover:** neutral-secondary-medium background, heading text color
- **Focus ring:** 4px, neutral-tertiary color
- **Drop-shadow:** `0 4px 0 var(--shadow-secondary)` (uses border-default color)

### Tertiary
- **Background:** neutral-primary-soft (white)
- **Border:** 2px, border-default
- **Text:** fg-brand color
- **Hover:** brand-softer background
- **Focus ring:** 4px, brand-soft color
- **Drop-shadow:** `0 4px 0 var(--shadow-secondary)`

### Success
- **Background:** success token
- **Border:** transparent
- **Text:** white
- **Hover:** success-medium background
- **Focus ring:** 4px, success-soft color
- **Drop-shadow:** `0 4px 0 var(--shadow-success)`

### Danger
- **Background:** danger token
- **Border:** transparent
- **Text:** white
- **Hover:** danger-medium background
- **Focus ring:** 4px, danger-soft color
- **Drop-shadow:** `0 4px 0 var(--shadow-danger)`

### Warning
- **Background:** warning token
- **Border:** transparent
- **Text:** dark color
- **Hover:** warning-medium background
- **Focus ring:** 4px, warning-soft color
- **Drop-shadow:** `0 4px 0 var(--shadow-warning)`

### Dark
- **Background:** dark token
- **Border:** transparent
- **Text:** white
- **Hover:** dark-strong background
- **Focus ring:** 4px, neutral-tertiary color
- **Drop-shadow:** `0 4px 0 var(--shadow-dark)`

### Ghost (NO drop-shadow)
- **Background:** transparent
- **Border:** transparent
- **Text:** heading color
- **Hover:** neutral-secondary-medium background
- **Focus ring:** 4px, neutral-tertiary color
- **No drop-shadow effect**

### Disabled (NO drop-shadow)
- **Background:** disabled token
- **Border:** 2px, border-default
- **Text:** fg-disabled color
- **Cursor:** not-allowed
- **No hover, no focus, no drop-shadow**

## Pressed / Active State

Across every variant that uses the drop-shadow:
- Translate the button 2px down (`transform: translateY(2px);`)
- Reduce shadow offset to `0 2px 0 var(--shadow-{variant});`
- This produces the tactile "press" effect characteristic of the reference design.

## Icons in Buttons

- Icon size: 18x18px
- Spacing: 8px gap between icon and label
- Layout: inline-flex, vertically centered
- Icons inherit the button's text color

---

## Source file: `cards.md`

# Cards

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `typography.md`

## Core Specs

- **Background:** neutral-primary-soft (white)
- **Border:** 2px, border-default color
- **Radius:** 12px (base)
- **Shadow:** shadow-xs (a flat 2px offset drop-shadow under the card)

## Card Heading

- Desktop: 20px, bold weight (700), heading color
- Mobile: 18px, bold weight (700), heading color
- Never skip heading levels — the page hierarchy must logically arrive at the card heading level.

## States

### Static Card (no interactivity)
- Background: neutral-primary-soft (white)
- Border: 2px, border-default
- Radius: 12px
- Shadow: shadow-xs
- No hover styles. Non-interactive cards must NOT have hover background changes.

### Interactive Card (clickable)
- Same base styles as static card
- Hover: brand-softer background, border-brand-subtle border
- Active/pressed: shifts down 2px and shadow shrinks
- Transition: background-color, border-color, transform 100ms ease-out
- Cursor: pointer

## Rules

- Background: neutral-primary-soft (white only — cards never use tinted backgrounds)
- Border: 2px, border-default
- Radius: 12px
- Shadow: shadow-xs (flat offset, no soft blur)
- Interactive hover: brand-softer background + border-brand-subtle
- Non-interactive: no hover styles

---

## Source file: `colors.md`

# Color Tokens

## Background Tokens

### Neutral
| Token | Light | Dark |
|---|---|---|
| neutral-primary-soft | #FFFFFF | #131F24 |
| neutral-primary | #FFFFFF | #131F24 |
| neutral-primary-medium | #FFFFFF | #1F2C30 |
| neutral-primary-strong | #FFFFFF | #2A3438 |
| neutral-secondary-soft | #FFFFFF | #131F24 |
| neutral-secondary | #FFFFFF | #131F24 |
| neutral-secondary-medium | #F7F7F7 | #1F2C30 |
| neutral-secondary-strong | #F7F7F7 | #2A3438 |
| neutral-tertiary-soft | #F7F7F7 | #131F24 |
| neutral-tertiary | #F7F7F7 | #1F2C30 |
| neutral-tertiary-medium | #E5E5E5 | #2A3438 |
| neutral-quaternary | #E5E5E5 | #37464F |
| quaternary-medium | #DBDBDB | #37464F |
| gray | #AFAFAF | #4B6B7C |

### Brand
| Token | Light | Dark |
|---|---|---|
| brand-softer | #E5FFC2 | #1A3300 |
| brand-soft | #C7F8A1 | #2D5500 |
| brand | #58CC03 | #58CC03 |
| brand-medium | #89E219 | #4A8A02 |
| brand-strong | #58A700 | #89E219 |

### Status
| Token | Light | Dark |
|---|---|---|
| success-soft | #E5FFC2 | #1A3300 |
| success | #58CC02 | #58CC02 |
| success-medium | #C7F8A1 | #2D5500 |
| success-strong | #58A700 | #89E219 |
| danger-soft | #FFE5E5 | #4A0000 |
| danger | #FF4B4B | #FF4B4B |
| danger-medium | #FFC4C4 | #8A0000 |
| danger-strong | #E62E2E | #FF7373 |
| warning-soft | #FFF8E0 | #4A3700 |
| warning | #FFC800 | #FFC800 |
| warning-medium | #FFE89B | #8A6F00 |
| warning-strong | #E6B400 | #FFD41F |

### Button Drop Shadow (CSS custom properties, used for the flat 4px drop-shadow under buttons)
| Variable | Light | Dark |
|---|---|---|
| `--shadow-brand` | #58A700 | #3D7400 |
| `--shadow-success` | #58A700 | #3D7400 |
| `--shadow-danger` | #E62E2E | #B71F1F |
| `--shadow-warning` | #E6B400 | #B38C00 |
| `--shadow-secondary` | #E5E5E5 | #2A3438 |
| `--shadow-dark` | #2A2A2A | #000000 |

### Utility
| Token | Light | Dark |
|---|---|---|
| dark | #4B4B4B | #4B4B4B |
| dark-strong | #3C3C3C | #2A2A2A |
| disabled | #F7F7F7 | #1F2C30 |

### Accent
| Token | Value (same both modes) |
|---|---|
| purple | #CE82FF |
| sky | #1CB0F6 |
| teal | #00CD9C |
| pink | #FF86D0 |
| cyan | #1CB0F6 |
| fuchsia | #DD3EFF |
| indigo | #8549BA |
| orange | #FF9600 |

## Text Color Tokens

### Base
| Token | Light | Dark |
|---|---|---|
| white | #FFFFFF | #FFFFFF |
| black | #3C3C3C | #3C3C3C |
| heading | #4B4B4B | #FFFFFF |
| body | #777777 | #AFAFAF |
| body-subtle | #AFAFAF | #777777 |

### Brand
| Token | Light | Dark |
|---|---|---|
| fg-brand-subtle | #C7F8A1 | #2D5500 |
| fg-brand | #58A700 | #89E219 |
| fg-brand-strong | #3D7400 | #C7F8A1 |

### Status
| Token | Light | Dark |
|---|---|---|
| fg-success | #58A700 | #89E219 |
| fg-success-strong | #3D7400 | #C7F8A1 |
| fg-danger | #E62E2E | #FF7373 |
| fg-danger-strong | #B71F1F | #FFB0B0 |
| fg-warning-subtle | #E6B400 | #FFC800 |
| fg-warning | #8A6F00 | #FFD41F |
| fg-disabled | #AFAFAF | #777777 |

### Informational / Accent
| Token | Light | Dark |
|---|---|---|
| fg-yellow | #FFC800 | #FFC800 |
| fg-info | #0E84B5 | #84D8F8 |
| fg-purple | #CE82FF | #CE82FF |
| fg-purple-strong | #8549BA | #DDB7FF |
| fg-cyan | #1CB0F6 | #84D8F8 |
| fg-indigo | #8549BA | #8549BA |
| fg-pink | #FF86D0 | #FF86D0 |
| fg-lime | #58CC02 | #89E219 |

## Border Color Tokens

| Token | Light | Dark |
|---|---|---|
| border-dark | #4B4B4B | #AFAFAF |
| border-buffer | #FFFFFF | #131F24 |
| border-buffer-medium | #FFFFFF | #1F2C30 |
| border-buffer-strong | #FFFFFF | #2A3438 |
| border-muted | #F7F7F7 | #131F24 |
| border-light-subtle | #F7F7F7 | #131F24 |
| border-light | #F7F7F7 | #1F2C30 |
| border-light-medium | #F7F7F7 | #2A3438 |
| border-default-subtle | #E5E5E5 | #131F24 |
| border-default | #E5E5E5 | #37464F |
| border-default-medium | #E5E5E5 | #37464F |
| border-default-strong | #DBDBDB | #4B6B7C |
| border-success-subtle | #C7F8A1 | #2D5500 |
| border-success | #58A700 | #89E219 |
| border-danger-subtle | #FFC4C4 | #8A0000 |
| border-danger | #E62E2E | #FF7373 |
| border-warning-subtle | #FFE89B | #8A6F00 |
| border-warning | #E6B400 | #FFC800 |
| border-brand-subtle | #C7F8A1 | #2D5500 |
| border-brand-light | #89E219 | #89E219 |
| border-brand | #58CC03 | #89E219 |
| border-dark-subtle | #4B4B4B | #2A3438 |
| border-purple | #CE82FF | #CE82FF |
| border-orange | #FF9600 | #FF9600 |

## Semantic Usage Rules

- Page/section backgrounds: neutral-primary-soft (default white) — every section uses a white background
- Primary buttons: brand background (vivid green)
- Headings: heading text color (Eel)
- Body text: body text color (Wolf)
- CTA links: fg-brand text color
- Default borders: border-default at 2px width
- Status borders match intent: success → border-success, danger → border-danger, warning → border-warning
- Disabled: disabled background + fg-disabled text

## Prohibited

- No raw hex/rgb values in component code — always use design tokens
- No brand text color for long-form paragraphs
- No accent text tokens (fg-purple, etc.) for body copy or navigation
- No brand/accent backgrounds for large layout surfaces (pages, sections) unless it's a hero/campaign area
- No manual light/dark value swapping — let the CSS custom properties handle it
- No off-white or tinted section backgrounds — sections must use pure white (#FFFFFF)

---

## Source file: `content.md`

# Content & Grid System

> Dependencies: `layout.md`, `typography.md`

## Containers

| Type | Max width | Horizontal padding |
|---|---|---|
| Standard | 1280px | 16px |
| Internal (reading) | 768px | — (45–75 char line length) |

## Vertical Padding

| Breakpoint | Vertical padding |
|---|---|
| Mobile | 32px |
| Tablet (≥768px) | 48px |
| Desktop (≥1024px) | 64px or 96px for hero/feature sections |

## Grid System

Mobile-first with flexible desktop configurations.

| Context | Gap |
|---|---|
| Standard content/cards | 32px |
| Compact widgets/metadata | 16px |

### Responsive Columns

| Breakpoint | Columns |
|---|---|
| Mobile (default) | 1–2 |
| Small/Tablet (≥640px) | 2–4 |
| Desktop (≥1024px) | 3–12 |

Full support for 6, 7, 8, 9+ column grids where needed.

## Breakpoints

| Name | Width |
|---|---|
| Small | 640px |
| Medium | 768px |
| Large | 1024px |
| Extra large | 1280px |
| 2x Extra large | 1536px |

## Rules

- Always design mobile-first
- Use layout shifts (column → row) to accommodate horizontal space
- Lists: 24px indentation, 12px vertical gap between items
- Body copy: 17px, 1.55 line-height
- All interactive links follow brand bold/hover-underline protocol
- All section backgrounds remain pure white — never tint a section background to delineate content

---

## Source file: `dropdown.md`

# Dropdown

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `inputs.md`

## Core Specs

### Chevron Icon
- Size: 18x18px
- Spacing: 6px left margin, -2px right margin
- Color: inherits from trigger button

### Menu Container
- Background: neutral-primary-soft (white)
- Border: 2px, border-default
- Radius: 12px (base)
- Shadow: shadow-md (flat 4px offset plus a soft ambient layer)
- Z-index: elevated above content

### Menu List
- Padding: 8px
- Font: 15px, body color, bold weight (700)

### Menu Item
- Layout: inline-flex, vertically centered, full width
- Padding: 12px horizontal, 10px vertical
- Radius: 12px
- Hover: brand-softer background, fg-brand-strong text
- Transition: colors, 150ms ease-out

## Trigger Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Small | 14px | 14px | 10px |
| Base | 15px | 18px | 12px |
| Large | 16px | 24px | 14px |

## Icon-only Trigger

- Padding: 10px
- Min size: 44x44px
- Icon: 20x20px

## Variants

### Default
- Menu width: 200px, items have 12px radius

### With Divider
- Top 2px border (border-default) between child groups, skip first group

### With Header
- Header padding: 16px horizontal, 12px vertical
- Bottom border: 2px, border-default
- Name: heading color, 15px, bold weight (700)
- Email: body-subtle color, 14px, truncated

### With Icons
- Icon before label: 18x18px, 10px right margin, body color
- On hover, icon color changes to fg-brand-strong

### With Checkbox / Radio
- Inputs: 18x18px, 12px radius for checkboxes, focus ring in brand-soft
- Helper text: 13px, body-subtle color, 4px top margin

### With Search
- Search input at top of menu following `inputs.md` specs (2px border)
- Left icon: 14px left padding, input 40px left padding

### Scrollable
- Max height: 240px, vertical scroll overflow

## States

| State | Appearance |
|---|---|
| Focused trigger | no outline, 2px brand ring |
| Hover item | brand-softer background, fg-brand-strong text |
| Active/open item | brand-soft background, fg-brand-strong text |
| Disabled item | fg-disabled text, not-allowed cursor, no pointer events |

---

## Source file: `icon-shapes.md`

# Icon Shapes

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- Box sizing: border-box
- Icon must be perfectly centered (inline-flex, centered both axes)
- Circle: fully rounded (9999px)
- Rounded square: 12px radius across every size

## Sizes

| Size | Container | Icon |
|---|---|---|
| XS | 28x28px | 16x16px |
| SM | 36x36px | 18x18px |
| MD | 44x44px | 22x22px |
| LG | 52x52px | 26x26px |
| XL | 64x64px | 32x32px |

## Color Variants

### Brand
- Shape: circle
- Background: brand-softer
- Icon color: fg-brand-strong

### Gray
- Shape: circle
- Background: neutral-secondary-medium
- Icon color: body

### Danger
- Shape: circle
- Background: danger-soft
- Icon color: fg-danger-strong

### Success
- Shape: circle
- Background: success-soft
- Icon color: fg-success-strong

### Warning
- Shape: circle
- Background: warning-soft
- Icon color: fg-warning

---

## Source file: `inputs.md`

# Inputs

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Display:** block, full width
- **Radius:** 12px (base)
- **Border:** 2px, border-default
- **Background:** neutral-primary-soft (white)
- **Shadow:** none by default — keep inputs flat against the white surface
- **Font:** 16px, heading color, din-2014-rounded-variable
- **Padding:** 14px horizontal, 12px vertical
- **Placeholder:** body color
- **Transition:** border-color and background-color, 150ms ease-out

## Label

- Display: block
- Font: 14px, bold weight (700), heading color, uppercase, 0.6px letter-spacing
- Margin bottom: 8px
- Label `htmlFor` must match the input `id`

## States

### Default
- Border: 2px, border-default
- Background: neutral-primary-soft (white)

### Hover
- Border: 2px, border-default-strong

### Focus
- No outline
- Border: 2px, border-brand
- Ring: 2px, brand-soft (offset outside the border for the chunky outlined look)

### Success
- Border: 2px, border-success
- Focus ring: 2px, success-soft

### Error / Danger
- Border: 2px, border-danger
- Focus ring: 2px, danger-soft

### Disabled
- Background: disabled
- Text: fg-disabled
- Cursor: not-allowed

## Input with Icons

- Icon size: 18x18px
- Icon color: body
- Container: relative positioned wrapper
- Start icon: absolutely positioned left, 14px left padding — input gets 40px left padding
- End icon: absolutely positioned right, 14px right padding — input gets 40px right padding
- Icons vertically centered within the wrapper

## Rules

- Every input must have a unique `id`
- Every label must have a matching `htmlFor`
- Padding: 14px horizontal, 12px vertical unless overridden for icon variants
- Border width is always 2px — never reduce to 1px
- No arbitrary hex or hardcoded colors

---

## Source file: `layout.md`

# Layout & Spacing

## Spacing Rhythm

Base unit: **8px**. All spacing values should be multiples of 8px.

| Context | Value |
|---|---|
| Section vertical padding | 96px |
| Section header → content | 48px or 64px |
| Heading → paragraph | 16px |
| Container horizontal padding | 24px |
| Flex/grid row gap | 16px |
| Card grid gap | 24px |
| Wide component grid gap | 32px |
| Column layout gap | 48px |

## Container

Standard section container: max-width 1152px, centered, 24px horizontal padding.

Every major section wraps content in this container.

## Content Composition Order

Inside each section, follow this order:
1. Heading (`h1`–`h3`)
2. Leading paragraph
3. Normal paragraph(s)
4. Lists, CTA links, or component grids

## Section Pattern

Each section has:
- 96px vertical padding
- A pure white background (neutral-primary-soft) — every section uses white; no alternating tinted backgrounds
- A centered container (max-width 1152px, 24px horizontal padding)
- A 2px border-default top divider when separation between consecutive sections is needed (rather than tinted backgrounds)
- A section header area with 48px bottom margin
- Section content below

## Motion & Animation

- Prefer CSS-native: `transition`, `animation`, `@keyframes`. Use Motion library only when CSS cannot achieve the behavior.
- Favor short, snappy transitions (100–150ms ease-out) for micro-interactions — buttons, cards, and inputs should feel tactile and responsive.
- Reserve scroll-triggered and hover transitions for moments that reinforce hierarchy or reward attention.
- Pressed states for buttons translate down 2px to mimic a physical press (paired with the drop-shadow shrink defined in `buttons.md`).

## Backgrounds & Visual Depth

- The whole product uses a pure white (#FFFFFF) canvas across every section — never tint section backgrounds.
- Depth comes from 2px crisp borders, flat offset drop-shadows, and bold illustrative accents — not from gradients or layered transparencies.
- Decorative accents (illustrations, mascot art, large emoji-style icons) may appear inside sections, but the surrounding background stays white.
- No gradient meshes, noise textures, or grain overlays on layout surfaces.

## Must

- All sections: pure white background, 96px vertical padding
- All containers: max-width 1152px, centered, 24px horizontal padding
- Section headers: 48px or 64px bottom margin
- Use 2px border-default lines (not background tints) when sections need visible separation
- Consistent vertical rhythm, no crowded sections
- Layouts readable and properly spaced on both desktop and mobile

---

## Source file: `lists.md`

# Lists

> Dependencies: `colors.md`

## Core Specs

- Item spacing: 16px vertical gap between list items
- Text: body color, 16px, regular weight (400)

## List Icons

- Size: 20x20px
- Prevent squishing: no shrink
- Spacing: 10px right margin between icon and text
- Active/featured icon: fg-brand color
- Neutral icon: body color

## Inactive / Disabled Items

Strikethrough text with body color decoration on the list item.

## Pattern

Vertical flex list with 16px gap. Each item is a flex row with centered alignment — icon (20x20, no-shrink, 10px right margin) followed by a span of body-colored text.

---

## Source file: `modals.md`

# Modals

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `buttons.md`, `inputs.md`

## Core Specs

### Overlay (Backdrop)
- Fixed, covers full screen
- Z-index: 40
- Background: black at 50% opacity
- Backdrop blur: small amount

### Content Container
- Background: neutral-primary (white)
- Radius: 12px (base)
- Border: 2px, border-default
- Shadow: shadow-xl
- Padding: 24px

## Anatomy

### Header
- Bottom border: 2px, border-default
- Top corners rounded (12px)
- Title: 22px, bold weight (700), heading color
- Close button: Ghost variant from `buttons.md`, 8px padding

### Body
- Vertical padding: 24px
- Vertical spacing between elements: 24px
- Text: 16px, 1.55 line-height, body color

### Footer
- Top border: 2px, border-default
- Bottom corners rounded (12px)
- Padding: 16px 24px

## Variants

### Default (Information)
Standard header + body + footer with primary/secondary action buttons.

### Pop-up (Confirmation)
Centered text, prominent icon, reduced padding:
- Body: 24px padding, text centered
- Icon: centered, 16px bottom margin, 56x56px, brand or status color

### Form Modal
Body contains inputs following `inputs.md` (2px borders). Vertical spacing between form elements: 16px.

## Rules

- Backdrop covers full screen with fixed positioning
- Content: white background, 2px border-default, 12px radius, shadow-xl
- Header/Footer separated by 2px border-default lines
- Close button must be present and functional
- Accessibility: `role="dialog"`, implement focus trap in code
- Dark mode automatic via token system

---

## Source file: `pagination.md`

# Pagination

> Dependencies: `colors.md`, `radius.md`

## Container

Font: 15px, bold weight (700). Items displayed as flex with -2px overlap for seamless 2px borders.

## Pagination Item

- Layout: flex, centered both axes
- Size: 40x40px
- Text: body color, bold weight (700)
- Background: neutral-primary-soft (white)
- Border: 2px, border-default
- Hover: brand-softer background, fg-brand-strong text
- Focus: no outline, 2px brand ring
- Overlap: -2px left margin

## Previous / Next Buttons

- Horizontal padding: 14px, height: 40px
- First item: 12px radius on inline-start side
- Last item: 12px radius on inline-end side

## Active Page Item

- Text: white
- Background: brand
- Border: transparent
- Hover text: white (stays same)
- Hover background: brand-medium

## Rules

- Display as flex with -2px child overlap for seamless 2px borders
- Items: white background, 2px border-default border, body text
- Active: white text, brand background
- First item: rounded start (12px), Last item: rounded end (12px)
- All items need hover and focus states

---

## Source file: `radios-checkboxes-toggle.md`

# Radios, Checkboxes & Toggles

> Dependencies: `colors.md`, `radius.md`

## Checkbox

- Size: 22x22px
- Radius: 12px
- Border: 2px, border-default
- Background: neutral-primary-soft (white)
- Focus ring: 2px, brand-soft
- Checked: brand background, white indicator (checkmark)

### Disabled
- Border: 2px, border-light
- Text: fg-disabled

## Radio

- Size: 22x22px
- Radius: fully rounded (9999px)
- Border: 2px, border-default
- Background: neutral-primary-soft (white)
- Focus ring: 2px, brand-soft
- Checked: 2px border-brand, indicator: brand color filled dot

### Disabled
- Border: 2px, border-light-medium
- Text: fg-disabled

Group all radio items under the same `name` attribute.

## Toggle

### Track
- Fully rounded
- Background: neutral-quaternary
- 2px border in border-default
- Focus-within ring: 2px, brand-soft
- Checked track: brand background, border transparent
- Disabled track: neutral-tertiary background

### Thumb
- Fully rounded
- Background: white
- 2px border in border-buffer color
- Subtle shadow-xs for elevation against the track

### Disabled
- Track: neutral-tertiary background
- Label: fg-disabled text

## Rules

- All selection inputs must have `id` matching label `htmlFor`
- All borders use 2px width — never reduce to 1px
- Focus states use the appropriate brand token for each control type
- Disabled states: no hover/focus interaction

---

## Source file: `radius.md`

# Border Radius

| Token | Value | Default usage |
|---|---|---|
| base | 12px | Buttons, cards, inputs, modals, sections, alerts, dropdowns, popovers, badges, tooltips, sidebars, table wrappers — the universal radius |
| default | 12px | Dropdown items, small controls, chips |
| sm | 12px | Checkboxes, tiny elements (kept at 12px for consistency; only icons inside small chips may use a smaller value when truly necessary) |
| full | 9999px | Pills, avatars, toggles, dot indicators |

## Rules

- 12px is the universal radius across the entire product — every element uses 12px unless it is explicitly a pill/circle (9999px)
- Never use arbitrary radius values outside this scale
- Radius must be consistent within each component family
- Small surfaces (checkboxes, micro-icons inside badges) may use 6px only when 12px would visually distort the element; default still favors 12px

---

## Source file: `shadows.md`

# Shadows

The reference design favors flat, offset drop-shadows that sit directly under elements (especially buttons and cards) rather than soft ambient blurs. Use these tokens accordingly.

| Token | CSS value |
|---|---|
| shadow-2xs | `0 2px 0 rgb(0 0 0 / 0.05)` |
| shadow-xs | `0 2px 0 rgb(229 229 229 / 1)` |
| shadow-sm | `0 4px 0 rgb(229 229 229 / 1)` |
| shadow-md | `0 4px 0 rgb(229 229 229 / 1), 0 6px 12px -4px rgb(0 0 0 / 0.06)` |
| shadow-lg | `0 6px 0 rgb(229 229 229 / 1), 0 10px 20px -6px rgb(0 0 0 / 0.08)` |
| shadow-xl | `0 8px 0 rgb(229 229 229 / 1), 0 16px 32px -8px rgb(0 0 0 / 0.1)` |
| shadow-2xl | `0 12px 24px -8px rgb(0 0 0 / 0.18)` |

## Component Mapping

| Component type | Token |
|---|---|
| Subtle separators, tiny UI details | shadow-2xs |
| Inputs, lightweight cards, buttons (resting offset) | shadow-xs or shadow-sm |
| Standard cards, popovers, dropdowns | shadow-sm or shadow-md |
| Prominent cards, sticky surfaces | shadow-md or shadow-lg |
| Modals, high-priority overlays | shadow-xl |
| Hero overlays, top-level emphasis (sparingly) | shadow-2xl |

## Rules

- Use only these tokens — no custom box-shadow values
- Buttons use a dedicated `0 4px 0 var(--shadow-{variant})` drop-shadow defined in `buttons.md` — not the generic shadow tokens
- Keep elevation steps intentional; avoid jumping multiple levels
- Components in the same family share the same baseline elevation
- Prefer flat offset shadows over blurred ambient shadows to match the reference style
- Never stack multiple unrelated shadow tokens on one element
- Never use shadow-xl/shadow-2xl for dense list items or body containers

---

## Source file: `sidebars.md`

# Sidebars

> Dependencies: `colors.md`, `radius.md`, `typography.md`, `badges.md`, `alerts.md`

## Core Specs

- Background: neutral-primary-soft (white)
- Right border: 2px, border-default (for left-sidebar); left border for right-sidebar
- Width: 256px

## Anatomy

### Outer Container
Hidden on mobile, visible at small breakpoint. Needs a toggle/trigger for mobile.

### Inner Wrapper
- Full height, vertical scroll overflow
- Padding: 12px horizontal, 16px vertical

### Navigation List
- Vertical spacing: 8px between items
- Font weight: bold (700), uppercase, 0.6px letter-spacing

### Navigation Item
- Layout: flex, vertically centered
- Padding: 12px horizontal, 12px vertical
- Text: heading color
- Radius: 12px (base)
- Border: 2px transparent (becomes visible on active state)
- Hover: brand-softer background
- Transition: colors, 100ms ease-out
- Icon: 22x22px, body color, hover → fg-brand color, 75ms transition
- Label: 12px left margin from icon

### Active Item
- Background: brand-softer
- Border: 2px, border-brand-subtle
- Text: fg-brand-strong
- Icon: fg-brand color

### Separator
- 16px top padding, 16px top margin
- Top border: 2px, border-default
- 8px vertical spacing below

### Bottom CTA / Card
- Padding: 16px
- Top margin: 24px
- Radius: 12px (base)
- Border: 2px, border-brand-subtle
- Background: brand-softer
- Can also use any alert variant from `alerts.md`

## Rules

- Responsive: hidden on mobile with a trigger mechanism
- Icons: 22x22px, body color (hover/active: fg-brand color)
- Multi-level menus: indent with 44px left padding
- Spacing follows 8px grid
- Active items use a 2px border-brand-subtle outline plus brand-softer fill
- Only neutral, brand, or status tokens — no arbitrary colors

---

## Source file: `tables.md`

# Tables

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Wrapper

- Horizontal scroll overflow
- Background: neutral-primary-soft (white)
- Radius: 12px (base)
- Border: 2px, border-default
- Shadow: shadow-xs (flat 2px offset)

## Table Element

- Full width, left-aligned text (right-aligned for RTL)
- Font: 15px, body color

## Table Head

- Font: 14px, body color, bold weight (700), uppercase, 0.6px letter-spacing
- Background: neutral-secondary-medium
- Bottom border: 2px, border-default
- Cell padding: 24px horizontal, 14px vertical

## Table Body

- Row background: neutral-primary (white)
- Row bottom border: 1px, border-default-subtle (kept hairline so dense data stays readable)
- Row hover: brand-softer background (optional)
- Row header: bold weight (700), heading color, no-wrap
- Cell padding: 24px horizontal, 16px vertical

## Rules

- Wrapper must have horizontal scroll overflow for responsive scrolling
- Wrapper border is 2px, internal row separators are 1px hairline
- Last row: omit bottom border to avoid doubling with wrapper border
- Row headers: always `scope="row"` for semantic structure
- Hover on rows is optional
- No arbitrary hex codes — use token colors only

---

## Source file: `tabs.md`

# Tabs

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Core Specs

- Typography: 14px, bold weight (700), body color, uppercase, 0.6px letter-spacing
- Transitions: colors and transform, 150ms ease-out

## Variants

### 1. Underline (Default)

**Wrapper:** bottom border, 2px border-default

**Tab Item:**
- Padding: 18px horizontal, 16px vertical
- Bottom border: 4px, transparent (offset down so it overlaps the wrapper border on active)
- Top corners: 12px radius
- Transition: colors, 150ms ease-out

| State | Appearance |
|---|---|
| Active | fg-brand text, 4px border-brand bottom border |
| Inactive | transparent bottom border; hover → heading text, 4px border-default-strong bottom border |
| Disabled | fg-disabled text, not-allowed cursor |

### 2. Pills

**Tab Item:**
- Padding: 18px horizontal, 12px vertical
- Radius: 12px (base)
- Border: 2px, transparent
- Font weight: bold (700)
- Transition: all, 150ms ease-out

| State | Appearance |
|---|---|
| Active | brand background, white text, shadow-xs |
| Inactive | body text; hover → brand-softer background, fg-brand-strong text |
| Disabled | fg-disabled text, not-allowed cursor |

### 3. Full Width

Children overlap with -2px left margin on all except first.

**Tab Item:**
- Full width, centered text
- Padding: 18px horizontal, 16px vertical
- Background: neutral-primary-soft (white)
- Border: 2px, border-default
- Transition: colors, 150ms ease-out
- Hover: brand-softer background, fg-brand-strong text

| State | Appearance |
|---|---|
| Active | brand-softer background, fg-brand-strong text, 2px border-brand-subtle |
| First item | rounded start (12px) |
| Last item | rounded end (12px) |

## Tabs with Icons

- Icon size: 18x18px or 20x20px
- Spacing: 10px right margin
- Layout: inline-flex, centered
- Icons inherit the text color of the tab state

---

## Source file: `tooltips-popovers.md`

# Tooltips & Popovers

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Tooltips

### Core Specs
- Padding: 12px horizontal, 8px vertical
- Font: 14px, bold weight (700)
- Radius: 12px
- Shadow: shadow-xs (flat 2px offset)
- Transition: opacity, 200ms ease-out

### Dark (Default)
- Background: dark
- Text: white
- Border: transparent

### Light
- Background: neutral-primary (white)
- Text: heading color
- Border: 2px, border-default

## Popovers

### Core Specs
- Background: neutral-primary (white)
- Radius: 12px (base)
- Shadow: shadow-md (flat offset + soft ambient)
- Border: 2px, border-default
- Transition: opacity, 200ms ease-out

### Header / Title
- Padding: 14px horizontal, 12px vertical
- Background: neutral-secondary-medium
- Bottom border: 2px, border-default
- Font: 15px, bold weight (700), heading color

### Body / Content
- Standard: 14px horizontal, 12px vertical padding; 14px, body color
- Rich: 16px padding; 14px, body color

## Arrows

- Size: 10x10px rotated 45deg
- Color must match the background of the tooltip/popover variant
- Light variants need a 2px border on two adjacent sides matching border-default

## Rules

- Tooltips: 12px radius
- Popovers: 12px radius
- Dark tooltips: dark background, white text, no border
- Light tooltips/popovers: white background + 2px border-default
- Arrows match parent background color (and border for light variants)

---

## Source file: `typography.md`

# Typography

> Dependencies: `colors.md`

## Core Rules

- **Font:** din-2014-rounded-variable, "DIN 2014 Rounded", "Nunito", system-ui, sans-serif — configured at app level, never override
- **Font weights available:** 400 (regular), 500 (medium), 700 (bold), 800 (extra bold)
- **Headings:** bold weight (700), heading text color, slightly tighter letter-spacing for an approachable, friendly tone
- **Body copy:** body text color, never use brand color for paragraphs longer than one sentence
- **Semantic HTML:** Use `h1`–`h6` in order, never skip levels

## Heading Scale

### Desktop

| Element | Size | Line-height | Letter-spacing | Margin-bottom |
|---|---|---|---|---|
| `h1` | 48px | 1.1 | -0.4px | 24px |
| `h2` | 36px | 1.15 | -0.3px | 20px |
| `h3` | 28px | 1.2 | -0.2px | 16px |
| `h4` | 24px | 1.25 | — | 12px |
| `h5` | 20px | 1.3 | — | 12px |
| `h6` | 18px | 1.35 | — | 8px |

### Responsive

| Element | Tablet (≥768px) | Mobile (default) |
|---|---|---|
| `h1` | 36px | 28px |
| `h2` | 32px | 24px |
| `h3` | 26px | 22px |
| `h4` | 22px | 20px |
| `h5` | 20px | 18px |
| `h6` | 18px | 16px |

Mobile-first: start with mobile sizes, scale up at tablet and desktop breakpoints.

Never reduce line-height below 1.1 for any heading.

## Paragraphs

### Leading Paragraph
- Size: 19px
- Weight: 500 (medium)
- Color: body
- Line-height: 1.6
- Max width: ~70 characters

### Normal Paragraph
- Size: 17px
- Weight: 400 (regular)
- Color: body
- Line-height: 1.55
- Max width: ~65 characters

### Small Supporting Copy
- Size: 14px
- Weight: 400 (regular)
- Color: body
- Line-height: 1.5
- Use only for helper text, legal text, captions, metadata.

## UI Labels

| Context | Size | Weight |
|---|---|---|
| Button labels | 16px | 700 (bold) |
| Input labels | 14px or 16px | 700 (bold) |
| Captions / meta / badges | 13px or 14px | 700 (bold) |

Button labels are uppercase by default with 0.8px letter-spacing for the bold, friendly feel typical of the reference design.

Do not apply paragraph line-height (1.55) to control labels.

## Links

- **Inline links:** Same size as surrounding text, fg-brand color, bold weight, no underline by default, hover → underline
- **CTA links:** fg-brand color, bold weight, uppercase, hover → underline

## Emphasis

- `<strong>` for high-priority emphasis in body text — use bold weight
- `<em>` for tone emphasis only, not visual hierarchy
- All-caps for short labels and primary calls to action: uppercase, 0.8px letter-spacing, 13px or 14px

## Dark Mode

Hierarchy stays identical. Only color tokens change (automatic via CSS custom properties). Size, weight, and spacing remain constant.