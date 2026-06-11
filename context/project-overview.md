# Carbon Compass AI

## Overview

Carbon Compass AI is an AI‑powered carbon footprint awareness platform designed to help individuals understand, track and reduce their personal greenhouse gas emissions. By combining a local emission‑factor calculation engine with generative AI guidance, the app turns climate awareness into actionable behaviour change. Users log daily activities, visualise their carbon impact, receive personalised recommendations and simulate lifestyle changes before committing to them. The goal is to make sustainability approachable for everyone without requiring technical knowledge of emissions data.

## Goals

1. **Lower the barrier to climate action:** Make it simple for users to understand their carbon footprint and highlight which behaviours matter most.
2. **Empower informed decisions:** Provide clear insights into which habits generate the most emissions and how small changes can make a difference.
3. **Deliver personalised guidance:** Use AI to suggest tailored actions based on each user’s behaviour, location and preferences.
4. **Support habit formation:** Encourage consistent tracking with gamified metrics, budgets and progress indicators.
5. **Protect user data:** Ensure all personal and activity data is handled securely and privately.

## Core User Flow

1. **Sign up / sign in:** Users authenticate via Clerk; route protection ensures only authenticated users can access personal data.
2. **Onboarding:** New users complete a brief questionnaire about their location, household size, commute habits, diet, electricity usage and sustainability goals.
3. **Dashboard:** Users land on a dashboard summarising their daily, weekly and monthly carbon footprint, category breakdowns and progress towards their carbon budget.
4. **Activity logging:** Users log activities across categories (transport, food, electricity, shopping, waste and flights); each entry triggers carbon calculations and updates the dashboard.
5. **AI carbon copilot:** Users interact with a chat‑style assistant that interprets natural language questions and provides personalised recommendations.
6. **Lifestyle simulator:** Users explore hypothetical scenarios (e.g. switching commute modes or adopting a vegetarian diet) and see projected reductions in carbon emissions.
7. **Insights & budgeting:** The app tracks the user’s performance against a monthly carbon budget and highlights top emission sources and reduction opportunities.
8. **Continuous engagement:** Gamified elements such as streaks, badges and progress bars motivate users to keep using the app.

## Features

### Authentication & profile management

- Integrate with Clerk to handle sign‑up, sign‑in and session management.
- Protect routes so only authenticated users can view and mutate their data.
- Maintain a profile table to store user‑specific data such as onboarding inputs, carbon budgets and preferences.

### Onboarding & carbon profile setup

- Guided multi‑step onboarding flow to collect baseline information: city, state, country, household size, diet type, typical commute mode/distance, average monthly electricity consumption and initial carbon budget.
- Use this information to generate a first estimated carbon footprint using the local emission engine.
- Allow users to edit their profile at any time from the settings page.

### Carbon engine & emission factor database

- A library of emission factors for common activities stored in a JSON file and imported at runtime.
- Functions to calculate emissions for transport, electricity, food, shopping, waste and flights.
- Aggregation helpers to calculate daily, weekly and monthly totals as well as category breakdowns.
- Support for custom emission factors through environment configuration to accommodate regional differences.

### Activity logging

- UI forms for each category allowing users to quickly input quantities (distance, kWh, servings, items, kg).
- Persist logs in PostgreSQL with references to the user profile.
- Calculate emissions on the fly using the carbon engine and store results in the log record.
- CRUD operations: allow users to edit or delete logs.

### Dashboard & visualisation

- Overview cards showing today’s footprint, this week’s total and remaining budget.
- Charts to visualise category distribution and trends over time.
- Leaderboard of top emission sources and recommended actions.
- Use Recharts and lazy‑loaded client components for charts.

### AI carbon copilot

- Chat interface powered by Gemini or OpenAI via Trigger.dev.
- Supports natural language queries such as “How can I reduce my transport emissions this week?” or “What’s my biggest contributor today?”.
- Provides contextual responses using the user’s data and carbon engine results.
- All AI calls run as background jobs to avoid blocking request handlers.

### Lifestyle simulator

- Predefined scenarios that adjust one or more variables (commute mode, diet frequency, electricity usage, shopping frequency).
- Compute hypothetical carbon footprints using modified variables and compare them against current data.
- Visualise potential reductions and highlight the biggest impact scenarios.

### Carbon budget & insights

- Allow users to set a monthly carbon budget.
- Track progress versus budget and show warnings when the user approaches or exceeds their budget.
- Identify the categories most responsible for overages and recommend targeted changes.

### Optional gamification (future scope)

- Streaks for consecutive days logged.
- Badges for milestones such as “First Vegetarian Week” or “10% Reduction”.
- Leaderboards comparing friends or communities (subject to privacy considerations).

## Scope

### In scope

- Authentication via Clerk and route protection
- User onboarding and profile management
- Emission factor database and local carbon calculation engine
- Activity logging across transport, food, electricity, shopping, waste and flights
- Dashboard with charts and carbon budget tracking
- AI carbon copilot via Trigger.dev and Gemini/OpenAI
- Lifestyle change simulator with predefined scenarios
- Persistent storage of user data, activities, budgets and simulation results
- Basic gamification elements (streaks, badges) if time permits

### Out of scope

- Social sharing or friend comparisons outside of the user’s own data
- Enterprise or team‑level dashboards and permissions
- Financial transactions, subscription billing or carbon offset purchasing
- Full mobile application (web‑responsive design only)
- Multi‑language support in the initial MVP
- Hardware integrations such as smart meters or IoT devices
- Detailed life cycle assessments of specific products (beyond category averages)

## Success Criteria

1. A new user can sign up, complete onboarding and see an initial carbon estimate.
2. Logged activities immediately update the dashboard with correct calculations.
3. Users can edit or delete their activity logs and see recalculated totals.
4. The AI copilot responds to natural language questions using up‑to‑date user data.
5. The simulator displays projected savings for at least three predefined scenarios.
6. Users can set and monitor a monthly carbon budget with visual indicators of progress.
7. All data is persisted via Prisma/PostgreSQL, and emission calculations rely on the local emission factor database.
8. The code adheres to the defined architecture and coding standards.
