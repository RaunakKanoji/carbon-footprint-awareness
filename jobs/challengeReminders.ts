import { cronTrigger } from '@trigger.dev/sdk';

import { ChallengeStatus } from '@/src/generated/prisma';
import { getChallengeProgress } from '@/src/server/challenges/challenges.service';
import { sendChallengeReminderEmail } from '@/src/server/notifications/emails.service';
import { prisma } from '@/src/db/prisma';

import { client } from './client';

export const challengeRemindersJob = client.defineJob({
  id: 'challenge-reminders',
  name: 'Active Challenge Nudge Notifications',
  version: '1.0.0',
  trigger: cronTrigger({
    cron: '0 12 * * *', // Daily at 12:00 PM
  }),
  run: async (_payload, _io, _ctx) => {
    // Fetch all active challenges across the platform
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        status: ChallengeStatus.ACTIVE,
      },
      select: {
        title: true,
        startedAt: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    let remindersSent = 0;

    for (const challenge of activeChallenges) {
      if (!challenge.user) continue;

      // Query the challenge progress
      const progress = await getChallengeProgress(
        { title: challenge.title, startedAt: challenge.startedAt },
        challenge.userId,
      );

      // Nudge user if challenge is not yet fully completed
      if (progress.percent < 100) {
        await sendChallengeReminderEmail(challenge.user.email, challenge.title);
        remindersSent++;
      }
    }

    return { activeChallengesChecked: activeChallenges.length, remindersSent };
  },
});
