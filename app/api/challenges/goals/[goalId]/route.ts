import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { GoalStatus } from '@/src/generated/prisma';

export async function PATCH(req: NextRequest, props: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await props.params;
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const body = await req.json();
    const { status } = body;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Goal not found or access denied' }, { status: 404 });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        status: status as GoalStatus,
      },
    });

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error) {
    console.error('API Error: PATCH /api/challenges/goals/[goalId]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await props.params;
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Goal not found or access denied' }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('API Error: DELETE /api/challenges/goals/[goalId]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
