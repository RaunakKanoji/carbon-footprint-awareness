You are a senior full-stack Next.js engineer.

I am building Carbon Compass AI, an AI-powered carbon footprint awareness platform. Tasks 1–11 are already completed:

1. Design system
2. Global theme
3. Dependencies installed
4. Tailwind/PostCSS setup
5. ESLint/Prettier setup
6. Icons setup
7. PostgreSQL + Prisma setup
8. Prisma schema models
9. Prisma migration + seed
10. Clerk auth setup
11. Auth context and route protection

Now I want to make the first clean GitHub commit by building the minimal application structure only.

Before writing code, read these files:

- `AGENTS.md`
- `context/project-overview.md`
- `context/architecture-context.md`
- `context/ui-context.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/progress-tracker.md`

Your task is to create a minimal, production-ready app shell for Carbon Compass AI.

Do NOT implement the full carbon engine, onboarding logic, activity logging, dashboard calculations, AI copilot, simulator, or analytics yet. Only create the base structure, routes, navigation, placeholder pages, layout, and reusable shell components so future feature tasks can be built cleanly.

Build the following structure:

app/
page.tsx
layout.tsx
globals.css

(auth)/
sign-in/[[...sign-in]]/page.tsx
sign-up/[[...sign-up]]/page.tsx

(app)/
layout.tsx
dashboard/page.tsx
onboarding/page.tsx
log/page.tsx
copilot/page.tsx
simulator/page.tsx
insights/page.tsx
challenges/page.tsx
profile/page.tsx
settings/page.tsx

components/
app/
app-shell.tsx
app-sidebar.tsx
app-topbar.tsx
mobile-bottom-nav.tsx
page-header.tsx
placeholder-state.tsx

landing/
landing-hero.tsx
feature-card.tsx

lib/
navigation.ts
routes.ts

Requirements:

1. Root Landing Page

Create a polished landing page at `/`.

It should include:

- App name: Carbon Compass AI
- Headline: “Your personal AI coach for reducing carbon footprint.”
- Subheadline: “Track daily activities, understand your emissions, and discover simple ways to reduce your impact.”
- Primary CTA: “Get Started”
- Secondary CTA: “View Demo”
- Feature cards:
  - Daily Carbon Tracking
  - AI Carbon Copilot
  - Lifestyle Simulator
  - Carbon Budget
- Use the design tokens from `ui-context.md`.
- Keep it lightweight and static for now.
- CTA buttons should link to `/sign-up` and `/dashboard`.

2. Auth Pages

Create Clerk Sign In and Sign Up pages using Clerk’s prebuilt components.

Routes:

- `/sign-in`
- `/sign-up`

Make sure the auth pages visually match the application theme:

- Centered card
- App logo/name
- Clean background
- No unnecessary custom logic

3. Protected App Shell

Create a protected app layout under `(app)/layout.tsx`.

It should:

- Require authentication using Clerk.
- Render a desktop sidebar.
- Render a topbar.
- Render a mobile bottom nav.
- Place page content in a responsive main area.
- Use consistent spacing and theme tokens.
- Not fetch complex data yet.

4. Sidebar Navigation

Create `components/app/app-sidebar.tsx`.

Navigation items:

- Dashboard → `/dashboard`
- Log Activity → `/log`
- AI Copilot → `/copilot`
- Simulator → `/simulator`
- Insights → `/insights`
- Challenges → `/challenges`
- Profile → `/profile`
- Settings → `/settings`

Use icons from the existing icon system or Lucide/FontAwesome setup already installed.

Highlight the active route.

5. Topbar

Create `components/app/app-topbar.tsx`.

It should include:

- Page title or current section name
- Search placeholder
- Notification icon placeholder
- Clerk user button/avatar

Do not implement real search or notifications yet.

6. Mobile Bottom Nav

Create `components/app/mobile-bottom-nav.tsx`.

Mobile nav items:

- Dashboard
- Log
- Copilot
- Simulator
- Profile

It should only display on small screens.

7. Placeholder Pages

Create simple placeholder pages for:

- `/dashboard`
- `/onboarding`
- `/log`
- `/copilot`
- `/simulator`
- `/insights`
- `/challenges`
- `/profile`
- `/settings`

Each page should use a shared `PageHeader` component and a `PlaceholderState` component.

Example:

Title: “Dashboard”
Description: “Your carbon overview will appear here after activity tracking is connected.”
Status badge: “Coming in Task 18”

Use these page mappings:

- Dashboard — Coming in Task 18
- Onboarding — Coming in Task 12
- Log Activity — Coming in Task 16
- AI Copilot — Coming in Tasks 20–21
- Simulator — Coming in Task 22
- Insights — Coming in Task 24
- Challenges — Coming in Task 23
- Profile — Coming in Task 13
- Settings — Coming in Task 19

8. Route Constants

Create `lib/routes.ts`:

Export route constants for all major pages.

Example:

export const routes = {
home: "/",
signIn: "/sign-in",
signUp: "/sign-up",
dashboard: "/dashboard",
onboarding: "/onboarding",
log: "/log",
copilot: "/copilot",
simulator: "/simulator",
insights: "/insights",
challenges: "/challenges",
profile: "/profile",
settings: "/settings",
} as const;

9. Navigation Config

Create `lib/navigation.ts`.

Export navigation arrays for:

- sidebar navigation
- mobile navigation
- marketing navigation

Each navigation item should include:

- title
- href
- icon key or icon component
- description where useful

10. Reusable Components

Create:

`PageHeader`
Props:

- title
- description
- badge optional

`PlaceholderState`
Props:

- title
- description
- actionLabel optional
- actionHref optional

`AppShell`
Props:

- children

The app shell should compose sidebar, topbar, and main content layout.

11. Styling Rules

Follow `ui-context.md`.

Do:

- Use theme tokens.
- Use shadcn/ui primitives where available.
- Use consistent card spacing.
- Use responsive layouts.
- Use accessible labels.
- Use semantic HTML.

Do NOT:

- Hardcode random hex colors.
- Add complex business logic.
- Add mock carbon calculations yet.
- Add database writes.
- Modify generated shadcn/ui components unless necessary.
- Implement full feature functionality beyond app structure.

12. Quality Requirements

After implementation:

- Run TypeScript check.
- Run lint.
- Run build.
- Fix all errors.
- Ensure every route renders.
- Ensure authenticated routes are protected.
- Ensure unauthenticated users can access `/`, `/sign-in`, and `/sign-up`.

13. Documentation Update

Update `context/progress-tracker.md`.

Add under Completed:

- Minimal app shell created
- Marketing landing page scaffolded
- Protected app route group created
- Sidebar, topbar, and mobile navigation added
- Placeholder pages added for future feature tasks

Add under Next Up:

- Task 12: Build onboarding form
- Task 13: Create user profile page
- Task 14: Implement carbon calculation engine

Final output should be a clean minimal app skeleton ready for the first GitHub commit.

Commit message suggestion:
“chore: initialize Carbon Compass AI app shell”
