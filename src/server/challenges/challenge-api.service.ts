import { z } from 'zod';

import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { ChallengeStatus } from '@/src/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import {
  CHALLENGE_TEMPLATES,
  checkAndCompleteChallenges,
  getChallengeProgress,
} from '@/src/server/challenges/challenges.service';

// POST schema validation
const joinChallengeSchema = z.union([
  z.object({ templateKey: z.string().min(1, 'Template key is required') }),
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    targetCo2eKg: z.coerce.number().positive(),
  }),
]);

// PATCH schema validation
const updateChallengeSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  action: z.enum(['abandon']),
});

export async function listChallenges() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // First sweep active challenges to auto-complete any that have met their targets
    await checkAndCompleteChallenges(userId);

    // Fetch user's challenges
    const challenges = await prisma.challenge.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    const activeChallengesRaw = challenges.filter((c) => c.status === ChallengeStatus.ACTIVE);
    const completedChallenges = challenges.filter((c) => c.status === ChallengeStatus.COMPLETED);

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

    // Determine available templates (not currently active or completed)
    const activeAndCompletedTitles = challenges
      .filter((c) => c.status === ChallengeStatus.ACTIVE || c.status === ChallengeStatus.COMPLETED)
      .map((c) => c.title);

    const availableTemplates = CHALLENGE_TEMPLATES.filter(
      (t) => !activeAndCompletedTitles.includes(t.title),
    );

    return NextResponse.json({
      success: true,
      activeChallenges,
      completedChallenges: completedChallenges.map((c) => {
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
      }),
      availableTemplates,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenge:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function createChallenge(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // Parse and validate body
    const body = await req.json();
    const result = joinChallengeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if ('title' in result.data) {
      const challenge = await prisma.challenge.create({
        data: {
          userId,
          title: result.data.title,
          description: result.data.description,
          targetCo2eKg: result.data.targetCo2eKg,
          status: ChallengeStatus.ACTIVE,
        },
      });
      return NextResponse.json({ success: true, challengeId: challenge.id }, { status: 201 });
    }

    const { templateKey } = result.data;

    // Find the template
    const template = CHALLENGE_TEMPLATES.find((t) => t.key === templateKey);
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Invalid challenge template key: ${templateKey}` },
        { status: 400 },
      );
    }

    // Check if user already has this challenge active
    const existingActive = await prisma.challenge.findFirst({
      where: {
        userId,
        title: template.title,
        status: ChallengeStatus.ACTIVE,
      },
    });

    if (existingActive) {
      return NextResponse.json(
        { success: false, error: 'You are already participating in this challenge' },
        { status: 400 },
      );
    }

    // Join/create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        userId,
        title: template.title,
        description: template.description,
        category: template.category,
        targetCo2eKg: template.points, // store point reward in targetCo2eKg
        status: ChallengeStatus.ACTIVE,
      },
    });

    return NextResponse.json(
      {
        success: true,
        challengeId: challenge.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('API Error: POST /api/challenge:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function abandonChallenge(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // Parse and validate body
    const body = await req.json();
    const result = updateChallengeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { challengeId, action } = result.data;

    // Find the challenge and verify ownership
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge || challenge.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found or access denied' },
        { status: 404 },
      );
    }

    if (challenge.status !== ChallengeStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, error: 'Only active challenges can be updated' },
        { status: 400 },
      );
    }

    // Abandon the challenge
    if (action === 'abandon') {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: ChallengeStatus.ABANDONED,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error: PATCH /api/challenge:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
