You are working inside my local Next.js App Router project for **Carbon Compass AI**.

We are preparing a **large MVP commit**. This is not the final production product, but it should feel polished enough for a beta/test launch or hackathon demo.

Your task is to perform a complete UI/UX polish pass across the app so the product feels intentional, consistent, premium, and usable.

Do not commit or push anything unless I explicitly ask.

---

# Objective

Polish the entire Carbon Compass AI app so it looks and feels like a finished MVP.

The app should feel:

* polished
* cohesive
* premium
* clean
* intentional
* fast enough for demo/beta use
* visually consistent
* easy to understand
* not overdesigned
* not unfinished or random

The product should still feel like an MVP, not an overbuilt final enterprise product.

---

# Product Design Direction

Carbon Compass AI is an AI-powered carbon footprint awareness platform.

It should feel like:

```txt
modern climate-tech SaaS dashboard
+ personal finance app
+ fitness tracker
+ AI assistant
```

The UI should be:

* clean
* calm
* optimistic
* data-driven
* trustworthy
* premium
* friendly but professional

Avoid:

* childish environmental visuals
* random green overload
* generic NGO-style design
* inconsistent icons
* inconsistent spacing
* mismatched card styles
* noisy gradients
* excessive shadows
* overly large empty spaces
* cramped forms
* unfinished demo placeholders

---

# Core Visual System

Use this design language consistently:

## Colors

Use the existing design tokens where available.

Main palette:

```txt
Background: #F5F7FA
Surface/Card: #FFFFFF
Elevated Surface: #F0F4F8
Primary Text: #111827
Secondary Text: #4B5563
Muted Text: #6B7280
Primary Accent: #10B981 emerald green
Primary Accent Soft: rgba(16,185,129,0.12)
AI Accent: #6366F1 indigo
Warning: #D97706 amber
Error: #DC2626 red
Success: #059669 green
Border: #D0D7DE
```

Rules:

* Emerald green is the main brand/sustainability accent.
* Indigo/purple should only be used intentionally for AI-specific elements.
* Amber is for warnings.
* Red is only for high-emission/error states.
* Do not use many random colors unless category-specific and consistent.

## Typography

Use one consistent modern sans-serif style.

Check:

* heading sizes
* body text sizes
* label sizes
* metric number sizes
* card title sizes
* form label styles
* table text sizes

Rules:

* Headings should be bold but not aggressive.
* Body text should be readable.
* Helper text should be muted.
* Large metrics should feel like dashboard metrics.
* Labels should use consistent casing.
* Do not mix random text sizes without purpose.

## Spacing

Use an 8px spacing system.

Check all pages for:

* inconsistent top/bottom padding
* excessive gaps
* cramped cards
* uneven section spacing
* footer/bottom spacing
* inconsistent header dividers
* clipped shadows

Rules:

* Pages should feel spacious but not wasteful.
* Main dashboard pages should fit well in desktop viewports.
* Important actions should be visible without awkward scrolling.
* Card spacing should be consistent across pages.

## Cards

Cards should feel part of the same system.

Standard card direction:

```txt
rounded-xl or rounded-2xl
white or surface background
subtle border
soft shadow
clean internal spacing
clear title/subtitle
no clipped shadows
no broken overflow
```

Audit all cards and make them consistent.

---

# UX Principles to Apply

Use these UX principles while polishing:

## 1. Visual Hierarchy

Each screen should clearly answer:

```txt
Where am I?
What is important?
What can I do next?
What changed?
```

Fix weak hierarchy in:

* page headers
* cards
* metric values
* CTA buttons
* forms
* tables
* charts
* empty states

## 2. Consistency

The app should feel like one product, not separate pages built at different times.

Make consistent:

* icon style
* icon size
* card radius
* button style
* form controls
* badges
* page headers
* table rows
* chart cards
* sidebar active states
* loading states
* empty states
* toasts
* error messages

## 3. Feedback

Every important user action should provide feedback:

* save success
* validation error
* loading state
* empty state
* offline blocked state
* API failure
* disabled button reason where relevant

## 4. Error Prevention and Recovery

Check:

* forms prevent invalid submits
* disabled buttons look intentional
* errors are clear and non-technical
* retry actions exist where appropriate
* no raw API/database errors shown to users

## 5. Progressive Disclosure

Do not overload pages.

Make complex pages easier by:

* grouping related content
* making secondary information muted
* keeping primary CTA clear
* reducing dense text blocks
* using cards and sections properly

## 6. Accessibility

Ensure:

* keyboard navigation works
* focus states are visible
* color contrast is good
* buttons have labels
* icons do not replace essential text
* form fields have labels
* invalid fields use `aria-invalid`
* errors use `aria-describedby`
* touch targets are large enough

---

# Areas to Audit and Polish

Inspect and polish these areas:

```txt
Landing page
Sign in / Sign up pages
Onboarding flow
Dashboard
Log Activity
AI Copilot
Lifestyle Simulator
Insights
Carbon Budget
Challenges
Profile / Settings
App shell
Sidebar
Topbar
Toasts
Offline warning
Error boundary
Forms
Tables
Charts
Empty states
Loading states
```

---

# Specific Polish Checklist

## 1. App Shell

Audit:

```txt
sidebar
topbar
main content wrapper
page padding
scroll behavior
active navigation item
user/avatar area
mobile/responsive navigation
```

Fix:

* inconsistent padding
* clipped shadows
* unnecessary full-page scroll
* active nav state
* icon alignment
* unreadable labels
* awkward topbar spacing
* duplicated route/loading flickers if still visible

Expected:

* Shell feels stable.
* Navigation is clear.
* Pages have consistent spacing.
* Content area feels premium and balanced.

---

## 2. Icons

The app currently may have mixed icon styles.

Audit:

```bash
grep -R "lucide\|FontAwesomeIcon\|fa-" -n app components lib
```

Rules:

* Prefer one icon family where possible.
* Lucide icons are preferred for interface/navigation.
* If FontAwesome is used for category icons, keep sizing/color consistent.
* Do not mix thick filled icons and thin outline icons randomly in the same section.
* Icon size should usually be:

  * `h-4 w-4` for inline labels
  * `h-5 w-5` for card headers
  * `h-6 w-6` only for larger feature icons
* Brand/primary icons should use emerald.
* AI-specific icons can use indigo only where intentional.

Fix:

* inconsistent icon sizes
* off-center icons
* random icon colors
* icons without text labels
* icons that look visually heavier than nearby text

---

## 3. Buttons

Audit all buttons.

Make consistent:

```txt
primary
secondary
ghost
danger
disabled
loading
icon button
CTA button
```

Rules:

* Primary CTA: emerald background, white text
* Secondary: white/surface with border
* Ghost: subtle hover
* Disabled: clear disabled state
* Loading: spinner or clear text
* Button height consistent:

  * small: h-8
  * normal: h-10
  * large CTA: h-11 or h-12
* Do not combine conflicting classes like `h-8 py-3.5`.

Fix:

* inconsistent heights
* random border radius
* awkward button shadows
* broken disabled states
* buttons without hover/focus states
* buttons cramped at page bottoms

---

## 4. Forms

Audit:

```txt
onboarding
activity logger
budget form
settings
profile
challenge actions
copilot input
```

Fix:

* inconsistent labels
* missing helper text
* unclear validation
* cramped inputs
* inconsistent select styling
* duplicated dropdown chevrons
* missing focus states
* poor error message placement

Expected:

* Forms feel calm and easy.
* Inputs have clear labels.
* Validation appears inline.
* Submit actions are visible.
* Form sections have clear grouping.

---

## 5. Page Headers

Every main page should have a consistent header system:

```txt
Title
Subtitle
Optional badge
Optional actions/filters
Full-width divider where used
```

Audit pages:

```txt
Dashboard
Log Activity
AI Copilot
Simulator
Insights
Budget
Challenges
Settings/Profile
```

Fix:

* inconsistent title size
* inconsistent subtitle spacing
* short divider lines
* uneven filter alignment
* page headers that take too much vertical space
* missing descriptions

---

## 6. Dashboard

Make dashboard demo-ready.

Audit:

* metric cards
* carbon score
* weekly chart
* category breakdown
* recent activities
* AI recommendation
* budget card
* card alignment

Fix:

* inconsistent card heights
* low hierarchy
* chart labels too small
* unclear metric units
* unbalanced grid
* excessive whitespace
* poor empty state when no data

Expected:

* Dashboard should be the most polished screen.
* It should communicate value immediately.
* Metrics should be easy to scan.
* Cards should align cleanly.

---

## 7. Log Activity

Audit:

* category tabs
* input form
* live calculation preview
* quick log cards
* today’s logged activities
* right info/tips panel

Fix:

* overly tall layout
* inconsistent category icons
* cramped form controls
* missing feedback after submit
* poor empty state
* right panel visual imbalance

Expected:

* It should feel quick and thumb-friendly.
* Users should understand what to log immediately.
* Estimated impact should be visually prominent.

---

## 8. AI Copilot

Audit:

* thread sidebar
* chat header
* chat messages
* chat input
* empty state
* loading state
* AI accent usage
* bottom shadow clipping
* icon color consistency

Fix:

* clipped shadows
* inconsistent icon color
* thread list spacing
* chat bubble spacing
* overly long messages without comfortable reading width
* input cramped at bottom
* duplicate scroll areas
* poor empty state

Expected:

* Copilot feels like a premium assistant panel.
* Chat input is always visible.
* Long messages scroll internally.
* Header and icon treatment are consistent with the app.

---

## 9. Lifestyle Simulator

Audit:

* tabs/sidebar
* scenario controls
* result card
* charts
* environmental impact cards
* “Commit to Lifestyle Changes” CTA
* bottom spacing

Fix:

* inconsistent bottom gap
* CTA height/padding conflict
* sticky side panel awkward spacing
* chart card cramped
* tabs too visually heavy
* excessive or missing padding

Expected:

* Simulator should feel like a “wow” MVP feature.
* Before/after impact should be satisfying and clear.
* CTA should feel intentional and aligned.

---

## 10. Insights

Audit:

* filters
* dropdown chevrons
* page title divider
* top carbon drivers labels
* heatmap hover clipping
* charts
* cards
* labels

Fix known issues:

```txt
duplicate chevron / overlapped select icons
divider line not full width
ChickenMeal should display as Chicken Meal
heatmap hover ring clipping
```

Also improve any weak visual hierarchy.

Expected:

* Analytics page feels clean, precise, and readable.
* Labels are human-readable.
* Visualizations are not clipped.

---

## 11. Budget

Audit:

* budget month handling
* active/archived/upcoming states
* target form
* history table
* summary cards
* status badges

Fix:

* month off-by-one display issues
* wrong archived/current status
* inconsistent table row spacing
* badge styling
* form spacing
* success/error feedback

Expected:

* Budget should feel like a finance app for carbon.
* Month selection and history should be trustworthy.

---

## 12. Challenges

Audit:

* challenge cards
* difficulty badge
* progress bar
* join/complete buttons
* empty/completed states
* toast feedback

Fix:

* card height mismatch
* inconsistent badges
* weak progress visuals
* unclear CTA state
* no empty state

Expected:

* Challenges should feel motivating but not childish.

---

## 13. Profile / Settings

Audit:

* profile sections
* preferences
* inputs
* notification settings
* data privacy note
* save feedback

Fix:

* inconsistent form controls
* unclear grouping
* weak labels
* missing helper text
* no success/error feedback

Expected:

* Settings should feel reliable and calm.

---

# Content Polish

Improve microcopy where needed.

Tone:

```txt
friendly
practical
non-judgmental
clear
encouraging
```

Use phrases like:

```txt
Small action, measurable impact.
Estimated carbon impact.
Based on standard emission factors.
You are improving.
Try this today.
```

Avoid:

```txt
guilt-heavy language
technical database terms
raw enum values
placeholder lorem ipsum
overly robotic AI text
```

Fix raw labels:

```txt
ChickenMeal -> Chicken Meal
IndiaGrid -> India Grid
PETROL_CAR -> Petrol Car
onboardingComplete -> Onboarding Complete
```

Create or reuse a formatter helper for display labels.

---

# Empty, Loading, and Error States

Every important data area should have a polished state for:

```txt
loading
empty
error
offline
success
```

Audit pages for blank sections.

Fix:

* blank tables
* empty charts
* no activities
* no conversations
* no challenges
* no budget
* API error
* offline mode

Expected:

* No section should look broken when data is missing.
* Empty states should explain what to do next.

---

# Responsive Polish

Test and polish:

```txt
mobile
tablet
desktop
large desktop
```

Viewports:

```txt
375x812
390x844
768x1024
1366x768
1440x900
1536x864
1728x1117
```

Fix:

* horizontal overflow
* clipped cards
* broken grids
* tiny buttons
* hidden CTAs
* bad mobile stacking
* awkward desktop gaps

---

# Performance Polish

The app should feel faster.

Audit:

```bash
grep -R "\"use client\"" -n app components
grep -R "recharts\|framer-motion\|FontAwesomeIcon\|dynamic" -n app components lib
grep -R "fetch(" -n app components lib
grep -R "prisma\." -n app lib
```

Improve where reasonable:

* avoid unnecessary client components
* avoid repeated profile/onboarding fetches
* avoid repeated API calls on refresh
* lazy-load heavy charts if useful
* avoid importing heavy chart libraries into shared app shell
* memoize expensive derived calculations where clear
* avoid redirect flicker
* keep route loading states lightweight

Do not over-engineer. Focus on visible performance and obvious inefficiencies.

---

# Code Quality Rules

Before making changes:

```bash
git status
git diff --name-status
```

Do not modify unrelated feature logic unless required for polish/performance.

Do not commit.

After changes:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Also run if available:

```bash
npm test
```

Fix any new TypeScript/lint/build issues caused by your changes.

---

# Visual QA Checklist

Manually inspect these pages:

```txt
/
sign-in
sign-up
/onboarding
/dashboard
/log or /activity
/copilot
/simulator
/insights
/budget
/challenges
/profile or /settings
```

For each page, check:

```txt
Does this look intentional?
Is the visual hierarchy clear?
Are icons consistent?
Are fonts consistent?
Are cards consistent?
Are buttons consistent?
Are forms accessible?
Are shadows clipped?
Are there raw enum labels?
Are there awkward gaps?
Are there duplicated icons?
Is the CTA obvious?
Does the page feel beta-ready?
```

---

# MVP Polish Acceptance Criteria

The polish pass is complete when:

* The app feels visually cohesive across all major pages.
* Icons are consistent in family, size, color, and weight.
* Typography hierarchy is consistent.
* Buttons and form controls follow one system.
* Cards have consistent borders, radius, padding, and shadows.
* Page headers follow one pattern.
* Empty/loading/error states are polished.
* No obvious clipped shadows or hover states remain.
* No raw database labels are shown to users.
* Onboarding/dashboard redirects do not flicker.
* App reloads and navigation feel noticeably faster.
* Mobile and desktop layouts are not broken.
* `npx tsc --noEmit` passes.
* `npm run lint` passes.
* `npm run build` passes.
* No secrets or local files are touched.

---

# Final Report

After completing the polish pass, give me a report:

```md
# MVP Polish Pass Report

## Status
Completed / Partially Completed / Failed

## Summary
Brief summary of what was polished.

## Design System Improvements
- Colors:
- Typography:
- Icons:
- Cards:
- Buttons:
- Forms:
- Spacing:

## UX Improvements
- Navigation:
- Feedback:
- Empty states:
- Error states:
- Loading states:
- Accessibility:

## Page-by-Page Changes
- Landing:
- Auth:
- Onboarding:
- Dashboard:
- Log Activity:
- AI Copilot:
- Simulator:
- Insights:
- Budget:
- Challenges:
- Profile/Settings:

## Performance Improvements
List any changes that improve reloads, navigation, or rendering.

## Files Changed
List changed files.

## Verification
- npx tsc --noEmit:
- npm run lint:
- npm run build:
- npm test, if available:

## Manual QA
List pages and viewport sizes tested.

## Remaining MVP Limitations
List things that are acceptable for beta but should be improved later.

## Commit Readiness
Say whether the app is ready for the big MVP commit.
```

Important:
Make the app feel finished enough for an MVP/beta launch, but do not spend time overbuilding final-product features. Focus on consistency, clarity, polish, and confidence.