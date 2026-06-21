import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { estimateActivityCarbon } from '@/src/server/carbon/activity-estimation.service';

const estimateSchema = z.object({
  category: z.enum(['TRANSPORT', 'FOOD', 'ENERGY', 'SHOPPING', 'WASTE']),
  subType: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  passengers: z.coerce.number().int().min(1).optional(),
  region: z.string().optional(),

  // Shopping specific fields
  shoppingCategory: z.string().optional(),
  productType: z.string().optional(),
  brand: z.string().optional().nullable(),
  purchaseSource: z.string().optional(),
  condition: z.string().optional(),
  material: z.string().optional(),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  packaging: z.string().optional(),
  expectedUsageDuration: z.string().optional(),

  // Energy specific fields
  energyName: z.string().optional().nullable(),
  energyCategory: z.enum(['sustainable', 'non-sustainable']).optional(),
  energyType: z.string().optional(),
  energySource: z.string().optional(),
  usageType: z.string().optional(),
  units: z.coerce.number().optional(),
  unitType: z.string().optional(),
  unitsKwh: z.coerce.number().optional(),
  period: z.string().optional(),
  place: z.string().optional(),
  members: z.coerce.number().optional().nullable(),
  generatorCapacity: z.coerce.number().optional().nullable(),
  generatorCapacityUnit: z.enum(['kW', 'kVA']).optional().nullable(),
  runtimeHours: z.coerce.number().optional().nullable(),
  loadPercentage: z.coerce.number().optional().nullable(),
  fuelQuantity: z.coerce.number().optional().nullable(),
  source: z.string().optional(),

  // Waste specific fields
  wasteCategory: z.enum(['biodegradable', 'degradable']).optional(),
  wasteType: z.string().optional(),
  wasteSource: z.string().optional(),
  disposalMethod: z.string().optional(),
  unit: z.string().optional(),
  segregationStatus: z.string().optional(),
  materialType: z.string().optional(),
  wasteForm: z.string().optional(),
});

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = estimateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid estimate payload',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const estimate = await estimateActivityCarbon(parsed.data);
    return NextResponse.json({ success: true, estimate });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'We could not calculate this activity estimate.',
      },
      { status: 400 },
    );
  }
}
