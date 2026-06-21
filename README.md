# Carbon Compass 🌿

**AI-powered carbon tracking for everyday decisions.**

Carbon Compass helps users understand, track, simulate, and reduce their personal carbon footprint through simple activity logging, personalized insights, AI coaching, lifestyle simulations, challenges, and social progress.

> **The game is not collecting points. The game is improving behavior.**

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?logo=tailwindcss&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white)

[Screenshots](#screenshots) · [Setup](#local-development) · [Architecture](#architecture) · [Data Sources](#carbon-estimation-strategy) · [Demo Guide](#demo-walkthrough-for-judges)

---

## Product Preview

![Carbon Compass Landing Page](docs/screenshots/landing-page.png)

---

## Why Carbon Compass?

Most people want to make better climate decisions, but carbon footprint tools are often too abstract, too manual, or too guilt-driven. Carbon Compass turns everyday actions into understandable insights and practical next steps.

Instead of asking users to become climate experts, Carbon Compass helps them answer:

- **What did I emit today?** — Live carbon estimates per activity logged
- **Which habits matter most?** — Category breakdown by food, transport, energy, shopping, waste
- **What can I change this week?** — Weekly missions, goals, and simulations
- **How much would a lifestyle change actually save?** — The Lifestyle Simulator calculates it before you commit
- **How can I stay consistent with friends?** — Leaderboards, streaks, XP, and milestones
- **Is this cart worth buying?** — The browser extension shows cart footprint before checkout

---

## Core Features

### 📊 Dashboard
See your daily, weekly, and monthly footprint at a glance. Includes carbon budget status, category breakdown, weekly trend charts, recent activity logs, streak tracking, and a live AI coach tip.

### 📝 Activity Logging
Log food, transport, energy, shopping, and waste activities using structured category forms. Supports barcode scanning, product search, AI-assisted input, and one-tap reuse of recent activities.

### ⚡ Carbon Estimates
Each logged activity produces a CO₂e estimate with a **confidence label** (`HIGH / MEDIUM / LOW`) and a **source label** (e.g., `Agribalyse`, `OpenRouteService`, `CarbonSutra`, `Carbon Compass Engine`) so users always know the basis of the estimate.

### 🔮 Lifestyle Simulator
Test lifestyle changes across transport, food, energy, shopping, and waste before committing them as goals. See simulated savings vs. your baseline in real time.

### 🏆 Challenges & Goals
Join weekly missions with XP rewards. Set personal goals. Earn experience points, unlock milestones, maintain streaks, and compete through global and friends leaderboards.

### 🤖 AI Carbon Coach
Ask questions about your own data and get personalized, practical suggestions powered by Gemini. The coach has access to your activity logs, goals, and lifestyle profile.

### 🛍️ Product & Shopping Impact
Estimate product carbon footprints through product name search, barcode scanning, ecommerce links, and receipt parsing. The **Chrome browser extension** surfaces cart footprint estimates before checkout and suggests lower-impact alternatives.

### 👤 Profile & Friends
Manage your account, privacy settings, friend connections, progress summary, XP, streaks, goals, and milestones from a unified Profile page.

---

## Screenshots

### 🖥️ Public Landing Page

![Carbon Compass Landing Page](docs/screenshots/landing-page.png)

---

### 📱 Product Application (Authenticated App)

<p align="center">
  <img src="docs/screenshots/dashboard.png" width="49%" alt="Dashboard" />
  <img src="docs/screenshots/activity.png" width="49%" alt="Activity Logging" />
</p>

<p align="center">
  <img src="docs/screenshots/simulation.png" width="49%" alt="Lifestyle Simulator" />
  <img src="docs/screenshots/challenges.png" width="49%" alt="Weekly Missions & Challenges" />
</p>

<p align="center">
  <img src="docs/screenshots/profile.png" width="49%" alt="User Profile" />
  <img src="docs/screenshots/coach.png" width="49%" alt="AI Carbon Coach" />
</p>

<p align="center">
  <img src="docs/screenshots/insights.png" width="49%" alt="Footprint Insights" />
  <img src="docs/screenshots/products.png" width="49%" alt="Product Footprints" />
</p>

---

## Product Walkthrough

### 1. Onboarding

New users answer a short lifestyle questionnaire covering diet type, commute mode and distance, monthly energy usage, shopping habits, and recycling behavior. Carbon Compass uses this to generate a **baseline carbon profile** — a starting estimate of annual kg CO₂e — which anchors all future comparisons.

### 2. Log daily activities

Users open the Activity page and select a category:

| Category | What you log |
|---|---|
| 🥗 Food | Meals by name, barcode scan, or ingredient search |
| 🚗 Transport | Mode, distance/route, or vehicle model |
| ⚡ Energy | Electricity consumption (kWh), appliance use, gas, fuel |
| 🛍️ Shopping | Product name, URL, barcode, or receipt |
| 🗑️ Waste | Waste type, weight, or recycling session |

Each log creates a **carbon estimate** with source and confidence labels immediately.

### 3. Understand the dashboard

The dashboard shows:
- **Daily average** and **weekly total** CO₂e
- **Weekly trend** — a stacked bar chart by category
- **Category share** — a pie chart breakdown
- **Budget remaining** — based on personal monthly carbon budget
- **Streak** — consecutive days with at least one log
- **Recent activity logs** with source/confidence labels
- **AI coach tip** — one personalized suggestion based on recent data

### 4. Simulate lifestyle changes

The Lifestyle Simulator lets users drag sliders or set parameters to test changes like:
- Switching from a petrol car to an EV or public transit
- Reducing beef meals per week
- Installing solar panels or reducing monthly kWh
- Buying fewer new products

The simulator shows **current baseline vs. simulated total** in real time, including monthly savings and percentage reduction.

### 5. Turn insights into action

Users can:
- Commit a simulation result directly as a personal **Goal**
- Join a **Weekly Mission** aligned with the simulated change
- Track progress through the **Challenges** page (missions, goals, milestones, leaderboards)
- Earn **XP** and unlock **milestones** for consistent logging and reductions

### 6. Shop with awareness

The **Carbon Compass Chrome Extension** runs on supported ecommerce sites (Amazon, Flipkart, Myntra, BigBasket, Blinkit, and more). It:
- Detects cart/checkout pages automatically
- Estimates the total carbon footprint of cart items
- Surfaces a breakdown by product
- Suggests alternatives: second-hand, delayed purchase, slower delivery, or fewer items
- Optionally saves the shopping activity directly to Carbon Compass

---

## Feature Deep Dive

### Dashboard

| Element | Detail |
|---|---|
| Carbon snapshot | Daily and weekly totals in kg CO₂e |
| Weekly trend | 7-day stacked bar chart by category |
| Category breakdown | Pie chart with percentage share |
| Recent logs | Last 5 activities with source labels |
| Budget status | Progress bar vs. monthly target |
| Streak counter | Days logged consecutively |
| AI coach tip | One personalized recommendation |

### Activity Logging Categories

Each category has tailored form fields:

**Food** — Meal name search, barcode scan via camera or manual code, ingredient-based lookup. Sources: Agribalyse dataset, Open Food Facts API, Carbon Compass Engine.

**Transport** — Select mode (car, bus, metro, train, flight, motorbike, EV, cycling, walking), enter route or distance. Uses OpenRouteService for route distance calculation, CarbonSutra for vehicle emission factors.

**Energy** — Log electricity consumption (kWh), fuel use (litres), appliance use by wattage × hours. Sources: CarbonSutra, Climatiq, Carbon Compass Engine with regional grid factor.

**Shopping** — Product name search, barcode, URL paste, or receipt upload. Sources: Product impact database, Climatiq, Carbon Compass Engine product mappings.

**Waste** — Type of waste (landfill, recycling, compost, e-waste), weight estimation. Source: Carbon Compass Engine with waste-stream factors.

### Lifestyle Simulator

The simulator works against a user's **baseline footprint** (calculated from onboarding answers). It supports:

- Adjustable sliders for transport, food, energy, shopping, and waste parameters
- Real-time calculation of **simulated total** vs. baseline
- Breakdown of savings per category
- Monthly CO₂e equivalent (e.g., "equivalent to planting 3 trees")
- One-click commit to Goal or Challenge

### Challenges & Gamification

| Feature | Description |
|---|---|
| Weekly missions | Time-bound challenges with clear success criteria and XP rewards |
| Personal goals | User-defined targets committed from simulations or manually |
| XP system | Earned by logging activities, completing missions, maintaining streaks |
| Milestones | Long-term achievements (e.g., "First 100 kg saved") |
| Leaderboards | Global, regional, and friends leaderboards by XP |
| Streak | Daily logging streak with visual calendar |

### Profile

The Profile page contains three tabs:

- **Account** — Name, email, avatar, Clerk auth management, privacy settings, leaderboard visibility toggle
- **Friends** — Send/accept friend requests, view friends list, remove connections
- **Summary** — Carbon profile overview, XP/level, milestones earned, active goals, logged activity statistics

---

## Architecture

Carbon Compass is a full-stack **Next.js 16** application with a modular feature-driven directory structure.

```
carbon-footprint-awareness/
├── app/
│   ├── (auth)/                  # Sign-in, sign-up (Clerk)
│   ├── (app)/                   # Protected app routes
│   │   ├── dashboard/
│   │   ├── activity/
│   │   ├── simulator/
│   │   ├── challenges/
│   │   ├── coach/
│   │   ├── insights/
│   │   ├── products/
│   │   ├── profile/
│   │   └── onboarding/
│   └── api/                     # API routes
├── components/
│   ├── app/                     # Shared app UI
│   └── landing/                 # Landing page sections
├── src/
│   ├── features/                # Feature modules
│   │   ├── activity-logging/
│   │   ├── dashboard/
│   │   ├── simulator/
│   │   ├── challenges/
│   │   ├── coach/
│   │   ├── insights/
│   │   ├── products/
│   │   └── profile/
│   ├── server/                  # Server-side services
│   │   ├── carbon/              # Carbon estimation engine
│   │   ├── activity/
│   │   ├── dashboard/
│   │   └── challenges/
│   ├── lib/                     # Shared utilities
│   │   ├── gamification/        # XP, milestones, streaks
│   │   └── api-clients/         # External API wrappers
│   └── db/                      # Prisma client
├── prisma/
│   └── schema.prisma
└── browser-extension/
    ├── public/manifest.json     # Chrome MV3 manifest
    └── src/                     # Extension source
        ├── content/             # Content scripts
        ├── background/          # Service worker
        └── popup/               # Extension popup
```

### Frontend

- **Next.js 16** App Router with React 19
- **TypeScript** throughout
- **Tailwind CSS v4** with custom design tokens
- **shadcn/ui-style** component library
- **Framer Motion** for animations
- **TanStack Query** for data fetching and caching
- **Recharts** for data visualization
- Fully responsive — desktop-first with mobile support

### Backend

- **Next.js API Routes** for server actions and REST endpoints
- **Prisma ORM** with PostgreSQL
- **Clerk** for authentication and user management
- Carbon estimation services with layered provider fallback
- Gamification engine (XP, missions, milestones, streaks)

### Browser Extension

- **Chrome Manifest V3**
- Content scripts for cart/product detection on ecommerce sites
- Service worker background script
- Popup UI with cart footprint summary
- Supports: Amazon, Flipkart, Myntra, BigBasket, Blinkit, Zepto, Swiggy, JioMart, Nykaa, Croma, Shopify stores

---

## Carbon Estimation Strategy

Carbon Compass uses a **layered estimation approach**:

1. Prefer verified dataset-backed estimates where available (Agribalyse for food, OpenRouteService + emission factors for transport)
2. Use category-specific external APIs for common activities (CarbonSutra, Climatiq)
3. Fall back to the internal **Carbon Compass Engine** when exact data is unavailable
4. Always show **confidence levels** (`HIGH / MEDIUM / LOW`) and **source labels** so users understand estimate quality

> The goal is not false precision. The goal is useful, transparent guidance that helps users compare choices and build better habits.

### Data Sources

| Area | Sources |
|---|---|
| Food | [Agribalyse v3.2](https://agribalyse.ademe.fr/), [Open Food Facts](https://world.openfoodfacts.org/), Carbon Compass Engine |
| Transport | [OpenRouteService](https://openrouteservice.org/) (route distance), [CarbonSutra](https://carbonsutra.com/) (vehicle emission factors) |
| Energy | [CarbonSutra](https://carbonsutra.com/), [Climatiq](https://climatiq.io/), Carbon Compass Engine (regional grid factors) |
| Shopping | Product carbon database, [Climatiq](https://climatiq.io/), Carbon Compass Engine product category mappings |
| Waste | Carbon Compass Engine with waste-stream emission factors |
| Flights | [CarbonSutra](https://carbonsutra.com/) flight estimate API |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| UI Components | shadcn/ui-style (Radix UI primitives) |
| Charts | Recharts |
| Auth | Clerk |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Data Fetching | TanStack Query v5 |
| AI | Google Gemini (Gemini Flash) |
| External APIs | CarbonSutra, Climatiq, OpenRouteService, Open Food Facts, Agribalyse |
| Browser Extension | Chrome Manifest V3 |
| Testing | Vitest + Testing Library |
| Package Manager | npm |

---

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (local or remote)
- API keys for external services (optional — the app uses fallback estimations without them)

### 1. Clone the repository

```bash
git clone https://github.com/RaunakKanoji/carbon-footprint-awareness.git
cd carbon-footprint-awareness
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in the required values in `.env.local`:

```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/carbon_compass
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI Coach (required for coach feature)
GEMINI_API_KEY=your_gemini_api_key

# Carbon APIs (optional — app uses internal engine as fallback)
CARBONSUTRA_API_KEY=your_rapidapi_key
CLIMATIQ_API_KEY=your_climatiq_key
OPENROUTESERVICE_API_KEY=your_ors_key
```

All available environment variables are documented in [`.env.example`](.env.example).

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample emission factors
npm run prisma:seed

# (Optional) Seed mock user data & activity logs for a fully populated dashboard view
npx tsx scripts/seed-mock-dashboard.ts
```

### 5. Start the development server

```bash
npm run dev
```

Open: [http://localhost:3001](http://localhost:3001)

> The app runs on port **3001** by default (configured in `package.json`).

---

## Chrome Extension Setup

The Carbon Compass browser extension helps users see estimated product/cart impact while shopping online.

> **Status: Prototype** — The extension is functional for local development and selected ecommerce sites. Production Chrome Web Store submission is planned.

### Supported sites

Amazon · Flipkart · Myntra · BigBasket · Blinkit · Zepto · Swiggy · JioMart · Nykaa · Croma · Shopify stores

### 1. Make sure the web app is running locally

```bash
npm run dev
```

### 2. Build the extension

```bash
cd browser-extension
npm install
npm run build
```

### 3. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension/dist` folder
5. Pin **Carbon Compass** in the toolbar

### 4. Test locally

Visit the built-in test page:

```
http://localhost:3001/dev/ecommerce-test
```

The extension should detect the simulated cart and show an estimated footprint overlay.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript type checks |
| `npm run test` | Run Vitest test suite |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:seed` | Seed database with emission factors |
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `npm run format` | Format code with Prettier |
| `npm run check:apis` | Check external API connectivity |

---

## Demo Walkthrough for Judges

**Recommended 3–5 minute flow:**

1. **Landing page** — Explain the product promise and the five tracked categories
2. **Sign in** and land on the **Dashboard** — Point out the weekly snapshot, category breakdown, streak, and AI tip
3. **Log a food activity** — Search for a meal by name, show the instant CO₂e estimate with Agribalyse source label and confidence rating
4. **Log a transport activity** — Enter a route, show how OpenRouteService calculates distance and the petrol/EV comparison
5. **Open the Simulator** — Adjust sliders for commute mode and beef meals, show real-time savings calculation
6. **Commit the simulation as a Goal** — Navigate to Challenges, show active mission, XP, and leaderboard position
7. **Open Profile → Summary** — Show XP, level, milestones, logged activity stats
8. **Load the dev checkout test page** — Show the Chrome extension detecting the cart and surfacing a footprint estimate
9. **Open the AI Coach** — Type a question like *"What is my biggest footprint source this week?"* and show a personalized response

---

## What Makes Carbon Compass Different?

Most climate apps either give you a one-time quiz result or track only one category. Carbon Compass is different because:

- **Tracks real daily behavior** — not a one-time quiz, but a live log updated every day
- **Full category coverage** — food, transport, energy, shopping, and waste in one place
- **Confidence-labeled estimates** — users always know how accurate an estimate is and where it came from
- **Lifestyle simulation before commitment** — test changes before making them real goals
- **Behavioral loop** — logging → insights → simulation → goals → missions → streaks → milestones
- **Social accountability** — friends, leaderboards, and shared missions keep users consistent
- **Point-of-purchase awareness** — the browser extension brings footprint data to the moment of buying
- **Guilt-free framing** — practical alternatives, not shame. The coach offers options, not lectures
- **AI grounded in your data** — the coach answers based on your actual logs, not generic advice

---

## Architecture Decision Notes

**Why Next.js App Router?** Server components reduce client bundle size for data-heavy pages like Dashboard and Insights. Server actions simplify mutation patterns for activity logging without a separate REST API.

**Why Prisma + PostgreSQL?** The data model is highly relational — users → activities → estimates → challenges → XP → milestones. A relational DB with type-safe ORM keeps this coherent at scale.

**Why layered carbon estimation?** No single API covers all five categories with high accuracy. A layered approach (verified dataset → external API → internal engine) maximizes coverage while allowing transparent confidence reporting.

**Why a Chrome Extension as a separate build?** Chrome Manifest V3 extensions require isolated content scripts and a service worker. The extension calls the Carbon Compass API over localhost during development and over the deployed API in production.

**Why Clerk for auth?** Clerk provides ready-made OAuth, session management, and webhook support, letting the team focus on carbon estimation and gamification logic instead of auth infrastructure.

---

## Roadmap

- [ ] Improve verified product carbon footprint matching (barcode → exact product → lifecycle data)
- [ ] Add more regional emission factors (EU, UK, US grid mixes)
- [ ] Expand Chrome extension support and publish to Chrome Web Store
- [ ] Add household/team accounts for shared carbon budgets
- [ ] Add weekly review email reports with personalized tips
- [ ] Add mobile app (React Native or progressive web app)
- [ ] Deeper AI coach memory across sessions
- [ ] Carbon budget recommendations calibrated by country/region
- [ ] Exportable personal climate impact report (PDF)
- [ ] Receipt OCR for automatic shopping activity parsing

---

## Current Limitations

Carbon footprint estimation is genuinely complex. It depends on location, supplier chain, product lifecycle, transport emissions, packaging, and end-of-life treatment. Carbon Compass uses the best available APIs, public datasets, and internal fallback models — but some estimates are **approximate** by necessity.

This is why every estimate shows:
- A **source label** (where the data comes from)
- A **confidence level** (`HIGH`, `MEDIUM`, or `LOW`)

The goal is not false precision. The goal is directionally correct, actionable guidance that helps users build better habits over time.

**Current known limitations:**
- Shopping estimates rely on product-category mappings rather than product-specific lifecycle data for most items
- The AI coach does not yet have persistent memory across sessions
- The Chrome extension is prototype-level and not yet published to the Chrome Web Store
- Some regional emission factors default to India-grid values and may not apply globally

---

## Built By

Carbon Compass was built as a hackathon project for the Carbon Footprint Awareness Platform challenge.

**Created by:** Raunak Kanoji

---

## License

License not yet specified.

---

<p align="center">
  <strong>Carbon Compass</strong> — Help people make lower-impact choices without guilt, complexity, or climate anxiety.
</p>
