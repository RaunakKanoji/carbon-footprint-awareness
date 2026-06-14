'use server';

import { auth } from '@clerk/nextjs/server';

import { refresh, revalidatePath } from 'next/cache';

import { ActivityCategory } from '@/app/generated/prisma';
import { calculateCo2e, getEmissionFactorInfo } from '@/lib/carbon-engine';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export interface LogActivityInput {
  category: string;
  subType: string;
  quantity: number;
  occurredAt?: string; // ISO date string from client input
  note?: string;
  passengers?: number;
}

/**
 * Server action to parse, validate, and record a user activity log entry,
 * computing emissions in real-time using the database carbon engine.
 */
export async function logActivityAction(input: LogActivityInput) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error('Unauthorized');
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    throw new Error('User not found in database');
  }

  const quantity = Number(input.quantity);
  if (isNaN(quantity) || quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  const passengers = Number(input.passengers) || 1;
  if (passengers < 1) {
    throw new Error('Passengers must be at least 1');
  }

  const effectiveQuantity =
    input.category.toUpperCase() === 'TRANSPORT' ? quantity / passengers : quantity;

  // Calculate emissions using the carbon engine
  const co2eKg = await calculateCo2e(input.category, input.subType, effectiveQuantity);

  // Retrieve matching factor details for structural consistency
  const factorInfo = await getEmissionFactorInfo(input.category, input.subType);

  const mappedCategory = input.category.toUpperCase() as ActivityCategory;
  const occurredDate = input.occurredAt ? new Date(input.occurredAt) : new Date();

  // Persist the computed log entry
  const log = await prisma.activityLog.create({
    data: {
      userId: dbUser.id,
      category: mappedCategory,
      subType: input.subType,
      quantity,
      unit: factorInfo?.unit || 'unit',
      factorUsed: factorInfo?.factor || 0,
      co2eKg,
      emissionFactorId: factorInfo?.id || null,
      note: input.note || null,
      occurredAt: occurredDate,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/insights');
  revalidatePath('/profile');
  revalidatePath('/challenges');
  refresh();

  return {
    success: true,
    logId: log.id,
    co2eKg: log.co2eKg,
  };
}
