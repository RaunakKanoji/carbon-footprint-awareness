import { z } from 'zod';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/src/lib/auth';

const budgetPostSchema = z.object({
  month: z.string().min(1, 'Month is required'),
  targetKg: z.coerce.number().positive('Budget target must be positive'),
});

export async function POST(req: Request) {
  try {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const result = budgetPostSchema.safeParse(body);
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

    const { month, targetKg } = result.data;

    const parsedDate = new Date(month);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid month date format' },
        { status: 400 },
      );
    }

    // Normalize to first day of the month, local time
    const monthDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1, 0, 0, 0, 0);

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId: dbUser.id,
          month: monthDate,
        },
      },
      update: {
        targetKg,
      },
      create: {
        userId: dbUser.id,
        month: monthDate,
        targetKg,
      },
    });

    return NextResponse.json({
      success: true,
      budgetId: budget.id,
      targetKg: budget.targetKg,
    });
  } catch (error) {
    console.error('API Error: POST /api/budget:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 401 },
      );
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    // Look up current month's budget
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: dbUser.id,
          month: currentMonthStart,
        },
      },
    });

    let targetKg = 500.0; // Default fallback

    if (budget) {
      targetKg = budget.targetKg;
    } else {
      // Find latest historical budget target if available
      const latestBudget = await prisma.budget.findFirst({
        where: { userId: dbUser.id },
        orderBy: { month: 'desc' },
      });
      if (latestBudget) {
        targetKg = latestBudget.targetKg;
      }
    }

    // Aggregate consumption from activity logs for the current month
    const aggregation = await prisma.activityLog.aggregate({
      where: {
        userId: dbUser.id,
        occurredAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        co2eKg: true,
      },
    });

    const consumption = aggregation._sum.co2eKg || 0;
    const remaining = targetKg - consumption;

    return NextResponse.json({
      success: true,
      budget: {
        month: currentMonthStart.toISOString(),
        targetKg,
      },
      consumption,
      remaining,
    });
  } catch (error) {
    console.error('API Error: GET /api/budget:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
