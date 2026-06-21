import { z } from 'zod';

import { NextResponse } from 'next/server';

import { ORS_PROFILES } from '@/src/integrations/openrouteservice/constants';
import { getRouteMatrix } from '@/src/server/location/openrouteservice.service';
import { getCurrentUser } from '@/src/lib/auth';

const schema = z.object({
  locations: z.array(z.object({ lat: z.coerce.number(), lng: z.coerce.number() })).min(2),
  sources: z.array(z.number().int()).optional(),
  destinations: z.array(z.number().int()).optional(),
  profile: z.enum(ORS_PROFILES).default('driving-car'),
  metrics: z.array(z.enum(['distance', 'duration'])).optional(),
});

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid matrix payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, matrix: await getRouteMatrix(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Matrix failed' }, { status: 400 });
  }
}
