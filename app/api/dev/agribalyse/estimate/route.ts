import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { estimateFoodWithAgribalyse } from '@/src/server/food/agribalyse-estimate.service';

const schema = z.object({
  factorId: z.string().min(1),
  quantityKg: z.coerce.number().positive(),
});

export async function POST(req: Request) {
  if (!isAgribalysePlaygroundEnabled()) return NextResponse.json({ error: 'Developer API playground is disabled' }, { status: 403 });
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid estimate payload' }, { status: 400 });
  const result = await estimateFoodWithAgribalyse(parsed.data);
  return NextResponse.json({ status: result.estimate.status, estimate: result.estimate, activity: result.activity });
}
