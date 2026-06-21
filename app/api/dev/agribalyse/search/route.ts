import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { searchAgribalyseFoodFactors } from '@/src/server/food/agribalyse-search.service';

const schema = z.object({ query: z.string().optional(), category: z.string().optional(), version: z.string().optional(), limit: z.coerce.number().optional() });

export async function POST(req: Request) {
  if (!isAgribalysePlaygroundEnabled()) return NextResponse.json({ error: 'Developer API playground is disabled' }, { status: 403 });
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid search payload' }, { status: 400 });
  return NextResponse.json({ results: await searchAgribalyseFoodFactors(parsed.data) });
}
