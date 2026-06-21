import { z } from 'zod';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { ActivityCategory } from '@/src/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import {
  activityEstimatePersistenceData,
  estimateActivityCarbon,
} from '@/src/server/carbon/activity-estimation.service';
import { checkAndCompleteChallenges } from '@/src/server/challenges/challenges.service';

const activityPostSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subType: z.string().min(1, 'SubType is required'),
  quantity: z.coerce.number().nonnegative('Quantity cannot be negative'),
  passengers: z.coerce.number().int().min(1).optional().default(1),
  occurredAt: z.string().optional(),
  note: z.string().optional(),
});

export async function createActivity(req: Request) {
  try {
    // getCurrentUser handles both auth and DB lookup; returns null if not signed in
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = activityPostSchema.safeParse(body);
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

    const { category, subType, quantity, passengers, occurredAt, note } = result.data;

    // Validate category enum
    const upperCategory = category.toUpperCase();
    const validCategories = Object.values(ActivityCategory) as string[];
    if (!validCategories.includes(upperCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid activity category: ${category}`,
        },
        { status: 400 },
      );
    }

    const mappedCategory = upperCategory as ActivityCategory;

    let estimate;
    try {
      estimate = await estimateActivityCarbon({
        category: mappedCategory as 'TRANSPORT' | 'FOOD' | 'ENERGY' | 'SHOPPING' | 'WASTE',
        subType,
        quantity,
        passengers,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: (err as Error).message || 'Calculation failed',
        },
        { status: 400 },
      );
    }

    const occurredDate = occurredAt ? new Date(occurredAt) : new Date();
    if (isNaN(occurredDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid occurredAt date format',
        },
        { status: 400 },
      );
    }

    // Save log entry to database
    const log = await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        category: mappedCategory,
        subType,
        activityType: subType,
        quantity,
        unit: estimate.unit,
        co2eKg: estimate.co2eKg,
        ...activityEstimatePersistenceData(estimate),
        note: note || null,
        occurredAt: occurredDate,
      },
    });

    await handleNewActivityLog(log);

    // Check for challenge progress completions
    const completedChallenges = await checkAndCompleteChallenges(dbUser.id);

    revalidatePath('/dashboard');
    revalidatePath('/insights');
    revalidatePath('/profile');
    revalidatePath('/challenges');

    return NextResponse.json(
      {
        success: true,
        logId: log.id,
        co2eKg: log.co2eKg,
        provider: estimate.provider,
        confidence: estimate.confidence,
        fallbackUsed: estimate.fallbackUsed,
        sourceLabel: estimate.sourceLabel,
        explanation: estimate.explanation,
        completedChallenges,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('API Error: /api/activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
