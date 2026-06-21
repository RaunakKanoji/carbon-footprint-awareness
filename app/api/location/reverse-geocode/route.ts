import { z } from 'zod';

import { NextResponse } from 'next/server';

import { reverseGeocode } from '@/src/server/location/openrouteservice.service';
import { getCurrentUser } from '@/src/lib/auth';

const schema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export async function GET(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid reverse geocode query', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, results: await reverseGeocode(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Reverse geocode failed' }, { status: 400 });
  }
}
