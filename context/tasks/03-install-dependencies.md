# Install Project Dependencies

## Goal

Set up the core development environment by installing all required packages and scaffolding the base Next.js application with TypeScript. This establishes a solid foundation for the rest of the project work.

## Implementation

1. **Initialize the Project:** If not already created, bootstrap a new Next.js application with TypeScript:

   ```bash
   npx create-next-app@latest carbon-compass --typescript --tailwind --eslint --app
   cd carbon-compass
   ```

   This generates the basic project structure with TypeScript and Tailwind preconfigured.

2. **Install Core Dependencies:** Run the following commands to install the primary packages for our tech stack:

   ```bash
   npm install @prisma/client prisma
   npm install @clerk/nextjs
   npm install zod @hookform/resolvers react-hook-form
   npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
   npm install @shadcn/ui
   npm install @trpc/server @trpc/client @tanstack/react-query
   npm install framer-motion recharts
   npm install dotenv
   ```

   These packages cover database access (Prisma), authentication (Clerk), form validation (React Hook Form + Zod), icons (Font Awesome), UI components (shadcn/ui), API and state management (tRPC + React Query), animations (Framer Motion), charts (Recharts), and environment variable management.

3. **Install Dev Dependencies:** For development and quality assurance, install:

   ```bash
   npm install -D typescript @types/node
   npm install -D tailwindcss postcss autoprefixer
   npm install -D prettier prettier-plugin-tailwindcss eslint-config-prettier
   npm install -D ts-node ts-node-dev
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```

   These packages enable TypeScript type checking, Tailwind CSS, code formatting, linting, live reloading, and testing.

4. **Update Scripts:** Modify the `package.json` scripts section to include commands for development, build, prisma, seed, tests, and Trigger.dev jobs (to be added later). Example:

   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "prisma:migrate": "prisma migrate dev --preview-feature",
       "prisma:generate": "prisma generate",
       "prisma:seed": "ts-node prisma/seed.ts",
       "test": "vitest --run",
       "format": "prettier --write .",
       "lint:fix": "eslint . --fix"
     }
   }
   ```

5. **Verify Installation:** Run `npm install` to ensure all dependencies are installed successfully. Resolve any peer dependency warnings or conflicts. Commit the lockfile for reproducibility.

## Check When Done

- The Next.js app compiles without errors using `npm run dev`.
- `node_modules` contains the installed packages, and the `package.json` includes scripts for build, migrate, seed, lint, format, and test.
- Running `npx prisma -v` and `npx next -v` prints the expected versions.
- You have committed the initial project scaffold with dependencies installed and documented in `progress-tracker.md`.
