import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { listFoodFactorMappings, saveFoodFactorMapping } from '@/src/server/food/food-mapping.service';

const schema = z.object({
  appCategory: z.string().min(1),
  appActivityType: z.string().optional(),
  openFoodFactsTag: z.string().optional(),
  openFoodFactsCategory: z.string().optional(),
  label: z.string().min(1),
  description: z.string().optional(),
  agribalyseFoodFactorId: z.string().optional(),
  agribalyseName: z.string().optional(),
  agribalyseCode: z.string().optional(),
  defaultQuantityKg: z.coerce.number().positive().optional(),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    return NextResponse.json({ mappings: await listFoodFactorMappings() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load mappings' },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid mapping payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ mapping: await saveFoodFactorMapping(parsed.data) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not create mapping' },
      { status: 400 },
    );
  }
}
