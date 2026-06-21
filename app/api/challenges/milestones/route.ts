import { NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // 1. Fetch all milestones
    const milestones = await prisma.milestone.findMany({
      orderBy: { targetValue: 'asc' },
    });

    // 2. Fetch user's unlocks/progress
    const userMilestones = await prisma.userMilestone.findMany({
      where: { userId },
    });

    const milestoneList = milestones.map((m) => {
      const um = userMilestones.find((u) => u.milestoneId === m.id);

      return {
        id: m.id,
        key: m.key,
        title: m.title,
        description: m.description,
        category: m.category,
        targetMetric: m.targetMetric,
        targetValue: m.targetValue,
        xpReward: m.xpReward,
        progress: um?.progress ?? 0,
        unlockedAt: um?.unlockedAt ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      milestones: milestoneList,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/milestones:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
