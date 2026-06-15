import { z } from 'zod';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { ActivityCategory } from '@/app/generated/prisma';
import { calculateCo2e, getEmissionFactorInfo } from '@/lib/carbon-engine';
import { checkAndCompleteChallenges } from '@/lib/challenges';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

const activityPostSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subType: z.string().min(1, 'SubType is required'),
  quantity: z.coerce.number().nonnegative('Quantity cannot be negative'),
  passengers: z.coerce.number().int().min(1).optional().default(1),
  occurredAt: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
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

    // Calculate effective quantity (divide by passengers if TRANSPORT)
    const effectiveQuantity =
      mappedCategory === ActivityCategory.TRANSPORT ? quantity / passengers : quantity;

    // Calculate CO2e using the carbon engine
    let co2eKg: number;
    try {
      co2eKg = await calculateCo2e(category, subType, effectiveQuantity);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: (err as Error).message || 'Calculation failed',
        },
        { status: 400 },
      );
    }

    // Fetch matching emission factor details for unit/factorUsed
    const factorInfo = await getEmissionFactorInfo(category, subType);

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
        quantity,
        unit: factorInfo?.unit || 'unit',
        factorUsed: factorInfo?.factor || 0,
        co2eKg,
        emissionFactorId: factorInfo?.id || null,
        note: note || null,
        occurredAt: occurredDate,
      },
    });

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
