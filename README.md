# Carbon Compass AI

Your personal AI coach for understanding and reducing your carbon footprint.

## Overview

Carbon Compass AI is an AI-powered sustainability platform that helps users understand, track, simulate, and reduce their personal carbon footprint through daily activity logging, carbon budgeting, and personalized AI recommendations.

Carbon Compass AI helps individuals track emissions from daily activities such as transport, food, electricity, shopping, waste, and travel. The platform converts lifestyle data into estimated CO₂e emissions, shows visual insights, and provides personalized suggestions through an AI carbon copilot.

## Problem Statement

Most people know climate change matters, but they do not know which daily habits create the most emissions or what realistic actions they can take. Carbon Compass AI solves this by making personal carbon impact visible, measurable, and actionable.

## Core Features

- **User Authentication**: Secure signup, sign-in, and session management integrated via Clerk.
- **Guided Onboarding**: Direct walkthrough flow to establish baseline carbon usage, geographic factor adjustments, and initial lifestyle preferences.
- **Daily Activity Logging**: Rapid tracking across transit, travel, nutrition, electricity usage, shopping, and waste management.
- **Carbon Footprint Calculation Engine**: Instant server-side calculation converting lifestyle inputs to estimated CO₂e kilograms based on localized factors.
- **Category-wise Emission Breakdown**: Clear visual analysis of emissions by category to identify high-impact target areas.
- **Carbon Budget Tracking**: Custom budget setting and progress indicators to stay within green bounds.
- **AI Carbon Copilot**: A context-aware chatbot that analyzes logs and provides personalized emission offset recommendations.
- **Lifestyle Simulator**: An interactive sandbox that lets users model "what-if" options (e.g. buying an EV or changing diets) before making the switch.
- **Insights & Analytics Dashboard**: Clean charts and trends to monitor reduction streaks and historical averages.
- **Habit-Building Challenges**: Gamified reduction milestones (e.g., "Meat-free Week" or "Cycle to Work") to encourage positive behaviors.

*Note: Some advanced features may be in progress depending on the current development stage of the roadmap.*

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org) (App Router), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org) | Core application layer and interactive views |
| **Styling** | [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) | Consistent CSS utility tokens and components |
| **Authentication** | [Clerk](https://clerk.com) | User session verification, sign-in, and onboarding states |
| **Database** | [PostgreSQL](https://www.postgresql.org), [Prisma ORM](https://www.prisma.io) | Relational database modeling, query layer, and driver adapter |
| **Background Jobs** | [Trigger.dev](https://trigger.dev) | Scheduled jobs (e.g. monthly resets) and async AI tasks |
| **AI Integration** | Gemini API or OpenAI API | Context-aware carbon engine chat agent and suggestions |
| **Charts** | [Recharts](https://recharts.org) | Responsive and accessible SVG data visualizations |
| **Code Review** | CodeRabbit | Automated repository checks and styling audit |
| **Deployment** | [Vercel](https://vercel.com) | Production serverless hosting |

## App Structure

```text
├── app/                  # Next.js App Router root pages and route handlers
│   ├── (auth)/           # Prebuilt Clerk sign-in and sign-up pages
│   ├── (app)/            # Protected app shell views (Dashboard, Simulator, Copilot, etc.)
│   └── api/              # Backend endpoint handlers and server action triggers
├── components/           # Reusable UI component definitions
│   ├── app/              # Private application layout parts (Sidebar, Topbar, Shell)
│   ├── landing/          # Public marketing page landing hero and features grid
│   └── ui/               # Standard design system components (buttons, cards, dialogs)
├── context/              # Main design plans, tasks, progress tracking, and standards
├── features/             # Feature-specific functional specs (copied to context/features/)
├── tasks/                # Checklist tasks (copied to context/tasks/)
├── lib/                  # Application utility logic and Prisma database clients
├── prisma/               # Database schema definition files and seed configurations
└── public/               # Static logo assets and vectors
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database instance
- Clerk account for auth keys
- Trigger.dev account for jobs API keys

### Setup Instructions

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd carbon-compass-ai
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/carbon_compass?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Provider Key
GEMINI_API_KEY=your_gemini_api_key

# Trigger.dev Keys
TRIGGER_API_KEY=tr_...
```

#### Step 4: Run Database Migrations and Seeding

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

#### Step 5: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal outputs) to view the application.

## Quality Checks & Commands

- **Run Dev Server**: `npm run dev`
- **Build Production**: `npm run build`
- **Lint Codebase**: `npm run lint`
- **Format Files**: `npm run format`
- **Run Tests**: `npm run test`
