# Configure Background Jobs with Trigger.dev

## Goal

Set up automated, long-running tasks using Trigger.dev to perform background operations such as sending weekly summaries, budget reminders, and cleaning up old data. This ensures time-based workflows run reliably without impacting the main application performance.

## Implementation

1. **Install Trigger.dev:** Ensure you have installed Trigger.dev as a dependency (see Task 03). Import the client in your code when needed:

   ```bash
   npm install @trigger.dev/sdk
   ```

2. **Register on Trigger.dev Dashboard:** Create an account on [Trigger.dev](https://trigger.dev) and set up a project for Carbon Compass. Obtain your API keys and configure Webhooks.

3. **Create Jobs Directory:** In your project, create a `trigger` or `jobs` directory. Each file here will define a job. For example:

   ```ts
   // trigger/weeklySummary.ts
   import { PrismaClient } from '@prisma/client';
   import { job } from '@trigger.dev/sdk';

   import { sendWeeklySummaryEmail } from '@/lib/emails';

   const prisma = new PrismaClient();

   export const weeklySummaryJob = job({
     id: 'weekly-summary',
     name: 'Send Weekly Summary Email',
     schedule: '0 9 * * MON', // Every Monday at 09:00
     async run() {
       // Fetch all users and their weekly emissions
       const users = await prisma.user.findMany();
       for (const user of users) {
         const weeklyTotal = await prisma.activityLog.aggregate({
           _sum: { co2e: true },
           where: { userId: user.id, createdAt: { gte: new Date(/* seven days ago */) } },
         });
         await sendWeeklySummaryEmail(user.email, weeklyTotal._sum.co2e);
       }
     },
   });
   ```

4. **Define Additional Jobs:** Create similar jobs for:
   - Budget reminders (e.g., alert users when they exceed 80% of their monthly budget).
   - Data clean‑up (e.g., remove activity logs older than two years to keep the database lean).
   - Challenge notifications (e.g., remind users to log meals for their Veggie challenge).

5. **Deploy Jobs:** Register the jobs with Trigger.dev’s runtime. For example, create an entry point file `trigger/index.ts` that exports all jobs. Configure environment variables for the API key and run the Trigger worker in production (e.g., `npm run trigger:dev` for development, `npm run trigger:start` for deployment).

6. **Schedule Cron:** Use Cron syntax in job definitions to specify when each job runs. Document the schedule and purpose of each job in `architecture-context.md`.

7. **Testing Jobs:** Run jobs locally in a development environment to ensure they execute as expected. Use Trigger.dev’s dashboards or logs to monitor execution and debug failures.

## Check When Done

- Trigger.dev is configured with at least one scheduled job (weekly summary) and runs successfully.
- The `jobs` directory contains job definitions for summaries, reminders, and data clean-up.
- Jobs access the database via Prisma, perform their tasks, and handle errors gracefully.
- The Trigger.dev dashboard shows successful job runs, and logs are monitored.
- Document job definitions and schedules in `progress-tracker.md` and `architecture-context.md`.
