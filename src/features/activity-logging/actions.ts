'use server';

import { auth } from '@clerk/nextjs/server';

import { refresh, revalidatePath } from 'next/cache';

import { prisma } from '@/src/db/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import { getCurrentUser } from '@/src/lib/auth';
import {
  activityEstimatePersistenceData,
  estimateActivityCarbon,
  toActivityCategory,
} from '@/src/server/carbon/activity-estimation.service';

export interface LogActivityInput {
  category: string;
  subType: string;
  quantity: number;
  occurredAt?: string; // ISO date string from client input
  note?: string;
  passengers?: number;

  // Shopping-specific details
  productName?: string | null;
  shoppingCategory?: string;
  productType?: string;
  brand?: string | null;
  purchaseSource?: string;
  condition?: string;
  material?: string;
  price?: number;
  currency?: string;
  packaging?: string;
  expectedUsageDuration?: string;
  weight?: number;

  // Energy-specific details
  energyName?: string | null;
  energyCategory?: 'sustainable' | 'non-sustainable';
  energyType?: string;
  energySource?: string;
  usageType?: string;
  units?: number;
  unitType?: string;
  unitsKwh?: number;
  period?: string;
  place?: string;
  members?: number | null;
  generatorCapacity?: number | null;
  generatorCapacityUnit?: 'kW' | 'kVA' | null;
  runtimeHours?: number | null;
  loadPercentage?: number | null;
  fuelQuantity?: number | null;
  source?: string;

  // Waste-specific details
  wasteCategory?: 'biodegradable' | 'degradable';
  wasteType?: string;
  wasteSource?: string;
  disposalMethod?: string;
  unit?: string;
  segregationStatus?: string;
  materialType?: string;
  wasteForm?: string;
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

  const category = input.category.toUpperCase() as
    | 'TRANSPORT'
    | 'FOOD'
    | 'ENERGY'
    | 'SHOPPING'
    | 'WASTE';
  const estimate = await estimateActivityCarbon({
    category,
    subType: input.subType,
    quantity,
    passengers,
    shoppingCategory: input.shoppingCategory,
    productName: input.productName,
    productType: input.productType,
    brand: input.brand,
    purchaseSource: input.purchaseSource,
    condition: input.condition,
    material: input.material,
    price: input.price,
    currency: input.currency,
    packaging: input.packaging,
    expectedUsageDuration: input.expectedUsageDuration,
    weight: input.weight,
    energyName: input.energyName,
    energyCategory: input.energyCategory,
    energyType: input.energyType,
    energySource: input.energySource,
    usageType: input.usageType,
    units: input.units,
    unitType: input.unitType,
    unitsKwh: input.unitsKwh,
    period: input.period,
    place: input.place,
    members: input.members,
    generatorCapacity: input.generatorCapacity,
    generatorCapacityUnit: input.generatorCapacityUnit,
    runtimeHours: input.runtimeHours,
    loadPercentage: input.loadPercentage,
    fuelQuantity: input.fuelQuantity,
    source: input.source,

    // Waste specific mapping
    wasteCategory: input.wasteCategory,
    wasteType: input.wasteType,
    wasteSource: input.wasteSource,
    disposalMethod: input.disposalMethod,
    unit: input.unit,
    segregationStatus: input.segregationStatus,
    materialType: input.materialType,
    wasteForm: input.wasteForm,
  });
  const occurredDate = input.occurredAt ? new Date(input.occurredAt) : new Date();

  const log = await prisma.activityLog.create({
    data: {
      userId: dbUser.id,
      category: toActivityCategory(category),
      subType: input.subType,
      activityType: input.subType,
      quantity,
      unit: estimate.unit,
      co2eKg: estimate.co2eKg,
      ...activityEstimatePersistenceData(estimate),
      note: input.note || null,
      occurredAt: occurredDate,
    },
  });

  await handleNewActivityLog(log);

  revalidatePath('/dashboard');
  revalidatePath('/insights');
  revalidatePath('/profile');
  revalidatePath('/challenges');
  refresh();

  return {
    success: true,
    logId: log.id,
    co2eKg: log.co2eKg,
    provider: estimate.provider,
    confidence: estimate.confidence,
    fallbackUsed: estimate.fallbackUsed,
    sourceLabel: estimate.sourceLabel,
    explanation: estimate.explanation,
  };
}
