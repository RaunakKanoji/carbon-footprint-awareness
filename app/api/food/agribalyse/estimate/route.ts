import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { estimateFoodWithAgribalyse } from '@/src/server/food/agribalyse-estimate.service';

const schema = z.object({
  factorId: z.string().min(1),
  quantityKg: z.coerce.number().positive(),
  createActivityLog: z.boolean().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid estimate payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const dbUser = parsed.data.createActivityLog ? await getCurrentUser() : null;
  if (parsed.data.createActivityLog && !dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await estimateFoodWithAgribalyse({
    factorId: parsed.data.factorId,
    quantityKg: parsed.data.quantityKg,
    createActivityLog: parsed.data.createActivityLog,
    userId: dbUser?.id,
    sourceContext: 'MANUAL_FOOD_LOG',
  });

  return NextResponse.json({ status: result.estimate.status, estimate: result.estimate, activity: result.activity });
}
