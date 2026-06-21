import { z } from 'zod';

import { NextResponse } from 'next/server';

import { estimateCarbonForRoute } from '@/src/server/carbon/route-carbon.service';
import { getCurrentUser } from '@/src/lib/auth';

const schema = z.object({
  routeId: z.string().optional(),
  distanceKm: z.coerce.number().positive(),
  transportMode: z.enum(['car', 'bike', 'bus', 'train', 'taxi', 'walking', 'cycling']),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Unknown']).optional(),
  provider: z.enum(['CARBONSUTRA', 'CARBON_INTERFACE', 'CLIMATIQ']).optional(),
});

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid route carbon payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, ...(await estimateCarbonForRoute({ userId: dbUser.id, ...parsed.data })) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Route carbon estimate failed' }, { status: 400 });
  }
}
