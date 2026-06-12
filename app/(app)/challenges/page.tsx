import React from 'react';

import { redirect } from 'next/navigation';

import { ChallengeStatus } from '@/app/generated/prisma';
import {
  CHALLENGE_TEMPLATES,
  checkAndCompleteChallenges,
  getChallengeProgress,
} from '@/lib/challenges';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

import ChallengesClient from './ChallengesClient';

export default async function ChallengesPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const userId = dbUser.id;

  // Perform a check and auto-complete any active challenges
  await checkAndCompleteChallenges(userId);

  // Fetch challenges for the user
  const challenges = await prisma.challenge.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  const activeChallengesRaw = challenges.filter((c) => c.status === ChallengeStatus.ACTIVE);
  const completedChallengesRaw = challenges.filter((c) => c.status === ChallengeStatus.COMPLETED);

  // Calculate progress for active challenges
  const activeChallenges = [];
  for (const challenge of activeChallengesRaw) {
    const progress = await getChallengeProgress(challenge, userId);
    const template = CHALLENGE_TEMPLATES.find((t) => t.title === challenge.title);
    activeChallenges.push({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      startedAt: challenge.startedAt.toISOString(),
      points: template?.points || 100,
      icon: template?.icon || 'leaf',
      badgeName: template?.badgeName || 'Eco Earner',
      progress,
    });
  }

  const completedChallenges = completedChallengesRaw.map((c) => {
    const template = CHALLENGE_TEMPLATES.find((t) => t.title === c.title);
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      completedAt: c.completedAt ? c.completedAt.toISOString() : null,
      points: template?.points || 100,
      icon: template?.icon || 'leaf',
      badgeName: template?.badgeName || 'Eco Earner',
    };
  });

  const activeAndCompletedTitles = challenges
    .filter((c) => c.status === ChallengeStatus.ACTIVE || c.status === ChallengeStatus.COMPLETED)
    .map((c) => c.title);

  const availableTemplates = CHALLENGE_TEMPLATES.filter(
    (t) => !activeAndCompletedTitles.includes(t.title),
  );

  return (
    <ChallengesClient
      initialActive={activeChallenges}
      initialCompleted={completedChallenges}
      initialAvailable={availableTemplates}
    />
  );
}
