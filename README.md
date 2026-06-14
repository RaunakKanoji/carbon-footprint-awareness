# Carbon Compass AI

Carbon Compass AI is an AI-powered carbon awareness and habit-building platform that helps users understand, track, and reduce their personal carbon footprint through daily activity logging, personalized insights, carbon budgeting, simulation, challenges, and AI coaching.

## Overview

Carbon Compass AI is built for the Carbon Footprint Awareness Platform challenge. The app turns everyday lifestyle choices into understandable CO2e estimates, then helps users make practical reduction decisions without needing to understand emissions science upfront.

The MVP combines activity logging, a personalized dashboard, AI coaching, insights, challenges, and a lifestyle simulator in one protected Next.js application. Users can establish a baseline profile, log daily transport, food, energy, shopping, and waste activity, then see how those actions affect their monthly footprint and budget.

The product is designed to make sustainability feel specific and actionable. Instead of only showing abstract climate data, Carbon Compass AI connects emissions to habits, trends, tradeoffs, and small behavior changes users can realistically try.

## Problem

People often want to reduce their climate impact but do not know which daily choices matter most. Carbon footprint data can feel abstract, generic, or too complicated to apply to ordinary decisions.

Carbon Compass AI addresses these pain points:

- Daily emissions are hard to estimate without tools.
- Carbon impact is usually presented as abstract numbers, not behavior feedback.
- Users need simple, actionable guidance tied to their own habits.
- Sustainability apps often feel either too complex or too generic.
- Habit change is easier when progress, goals, and reminders are visible.

## Solution

Carbon Compass AI helps users move from awareness to action through:

- Daily carbon activity logging across major lifestyle categories.
- A personalized footprint dashboard with weekly and monthly context.
- AI Copilot guidance based on profile, budget, and logged activity.
- A lifestyle simulator for testing reduction scenarios before committing.
- Insights and trends that identify top carbon drivers.
- Challenges and achievements that make progress visible.
- Budget tracking that turns carbon reduction into a monthly goal.
- Profile-based baseline estimates for more relevant recommendations.

## Key Features

### Dashboard

The dashboard summarizes the user's carbon footprint at a glance. It includes today's footprint, weekly footprint, monthly target, remaining budget, category breakdowns, recent activities, and AI suggestions.

### Log Activity

Users can log transport, food and meals, home energy, shopping, and waste activity. The form provides a live CO2e estimate before submission and records each activity with the selected category, subtype, quantity, unit, date, notes, and calculated emissions.

### AI Copilot

The AI Copilot acts as a carbon reduction coach. It can answer questions, review the user's carbon context, and provide practical recommendations for transport, food, energy, shopping, and budget goals. When an external AI key is not configured, the MVP still provides deterministic fallback guidance.

### Lifestyle Simulator

The simulator lets users model lifestyle changes before making them. It includes tabs for transport, diet, energy, and consumption changes, then estimates the potential monthly reduction impact and supports committing selected changes.

### Insights

Insights show a broader analytics view of the user's footprint. The page includes emission trend history, category share, top carbon drivers, commute patterns, and an activity heatmap.

### Challenges and Achievements

Challenges provide lightweight gamification for habit building. Users can view active and completed challenges, track progress, and use points, levels, streaks, and badges as motivation signals.

### Profile and Settings

The profile stores baseline inputs such as location, household size, diet type, commute mode, commute distance, and electricity usage. Settings provide account and preference surfaces for the MVP app shell.

### Error Handling and Notifications

The app includes standardized API responses, toast notifications, an offline warning flow, and client error handling surfaces so common failures can be communicated without breaking the full app experience.

## Screenshots

### Dashboard

![Dashboard](public/screenshots/01-dashboard.png)

### Log Activity

![Log Activity](public/screenshots/02-log-activity.png)

### AI Copilot

![AI Copilot](public/screenshots/03-ai-copilot.png)

### Lifestyle Simulator

![Lifestyle Simulator](public/screenshots/04-simulator.png)

### Insights

![Insights](public/screenshots/05-insights.png)

### Challenges

![Challenges](public/screenshots/06-challenges.png)

### Profile

![Profile](public/screenshots/07-profile.png)

### Settings

![Settings](public/screenshots/08-settings.png)

### Onboarding

![Onboarding](public/screenshots/09-onboarding.png)

### Mobile Preview

![Mobile Dashboard](public/screenshots/mobile/01-dashboard-mobile.png)

![Mobile Log Activity](public/screenshots/mobile/02-log-activity-mobile.png)

![Mobile AI Copilot](public/screenshots/mobile/03-ai-copilot-mobile.png)

![Mobile Insights](public/screenshots/mobile/04-insights-mobile.png)

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style component primitives and custom UI components
- Clerk authentication
- Prisma ORM
- PostgreSQL
- Docker Compose for local database setup
- Recharts for charts and visualizations
- Zod for validation
- React Hook Form for form state
- Lucide React and Font Awesome icons
- Gemini API and OpenAI API support for AI Copilot responses
- Trigger.dev SDK for background-job capability
- Vitest for tests

## Architecture

```txt
User
  |
  v
Next.js App Router UI
  |
  +--> Server Components and Server Actions
  |
  +--> API Routes
         |
         +--> Prisma ORM
         |      |
         |      v
         |   PostgreSQL
         |
         +--> AI Copilot Provider
                |
                v
          Personalized guidance
```

High-level app structure:

```txt
app/
  (auth)/          Clerk sign-in and sign-up routes
  (app)/           Protected MVP application pages
  api/             Activity, dashboard, budget, challenge, and copilot APIs
components/        App shell, feature components, charts, and UI primitives
lib/               Carbon calculations, dashboard aggregation, Prisma, utilities
prisma/            Schema and seed data
public/            Static assets and screenshots
```

## Data Model

Important Prisma models in the MVP:

- `User` - application user linked to Clerk.
- `Profile` - onboarding and baseline lifestyle data.
- `EmissionFactor` - category, subtype, unit, and factor metadata.
- `ActivityLog` - user activity entries and calculated CO2e.
- `Budget` - monthly carbon target per user.
- `Conversation` - AI Copilot thread metadata.
- `ConversationMessage` - user, assistant, and system messages.
- `Challenge` - habit-building challenge status and progress metadata.

## Carbon Calculation Method

Carbon Compass AI uses emission factors to estimate activity impact:

```txt
CO2e = quantity x emission factor
```

Examples:

- Transport: distance x kg CO2e per km
- Food: meals x kg CO2e per meal
- Electricity: usage x kg CO2e per kWh
- Waste: weight x kg CO2e per kg
- Shopping: quantity x kg CO2e per item

The MVP factors are generalized estimates intended for awareness and comparison. Future versions can improve accuracy with verified product carbon footprint data, regional factors, receipt parsing, and product-level integrations.

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd carbon-footprint-awareness
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` or `.env.local` in the project root.

```env
DATABASE_URL="postgresql://carbon:carbon@localhost:55432/carbon_compass"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=
OPENAI_API_KEY=
TRIGGER_API_KEY=
```

Only one AI provider key is required for live AI responses. If no AI key is configured, the Copilot route can still return fallback MVP guidance.

### 4. Start the local database

```bash
docker compose up -d
```

The included Docker Compose file starts PostgreSQL on local port `55432`.

### 5. Set up Prisma

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

If you prefer migration flow during development, use:

```bash
npm run prisma:migrate
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3001
```

The project script runs Next.js on port `3001`.

## Available Scripts

- `npm run dev` - start the Next.js development server on port 3001.
- `npm run build` - create a production build.
- `npm run start` - start the production server after building.
- `npm run lint` - run ESLint across JavaScript and TypeScript files.
- `npm run lint:fix` - run ESLint with automatic fixes.
- `npm run test` - run Vitest.
- `npm run format` - format files with Prettier.
- `npm run prisma:migrate` - run Prisma development migrations.
- `npm run prisma:generate` - generate Prisma client.
- `npm run prisma:seed` - seed the database.
- `npm run trigger:dev` - run Trigger.dev development tooling.
- `npm run trigger:start` - start Trigger.dev worker tooling.

## MVP Status

- [x] Authentication
- [x] Onboarding/profile setup
- [x] Dashboard
- [x] Activity logging
- [x] Carbon calculation engine
- [x] Carbon budget tracking
- [x] AI Copilot
- [x] Lifestyle simulator
- [x] Insights dashboard
- [x] Challenges and achievement-style progress
- [x] Toast notifications
- [x] Offline warning surface
- [x] Error handling and API response patterns
- [x] Desktop screenshots
- [x] Representative mobile screenshots

Standalone `/budget` and `/achievements` pages are not separate MVP routes yet. Budget status is currently surfaced in the dashboard, and achievement-style progress is surfaced through challenges and profile statistics.

## Known Limitations

- Emission factors are generalized MVP estimates.
- AI recommendations depend on available profile and activity log context.
- Product-level carbon footprint verification is not implemented yet.
- The app is optimized for the MVP web experience; deeper mobile polish can continue.
- Carbon offsets, receipt scanning, and verified product databases are planned future improvements rather than current MVP features.
- Some advanced background workflows are scaffolded but not required for the core MVP demo.

## Future Improvements

- Verified product carbon footprint database integration.
- Browser extension for eco-unfriendly purchase or travel decisions.
- Receipt, barcode, or product scanner.
- Community challenges and team competitions.
- Better ML personalization from user behavior over time.
- Carbon offsets or sustainability marketplace integrations.
- Richer analytics and exportable reports.
- PWA/mobile app support.
- Region-specific electricity grid and transport factors.

## License

License not specified yet.
