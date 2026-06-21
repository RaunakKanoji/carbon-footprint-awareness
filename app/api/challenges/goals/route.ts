import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { ActivityCategory, GoalMetric, GoalStatus } from '@/src/generated/prisma';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/goals:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const body = await req.json();

    const { title, category, metric, targetValue, timePeriod, difficulty } = body;

    if (!title || !category || !metric || !targetValue) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const startsAt = new Date();
    const endsAt = new Date();

    if (timePeriod === 'week') {
      endsAt.setDate(endsAt.getDate() + 7);
    } else {
      endsAt.setDate(endsAt.getDate() + 30);
    }

    // Determine XP Reward based on difficulty
    let xpReward = 200;
    if (difficulty === 'medium') xpReward = 400;
    if (difficulty === 'hard') xpReward = 800;

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        category: category as ActivityCategory,
        metric: metric as GoalMetric,
        targetValue: Number(targetValue),
        currentValue: 0,
        xpReward,
        startsAt,
        endsAt,
        status: GoalStatus.ACTIVE,
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('API Error: POST /api/challenges/goals:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
