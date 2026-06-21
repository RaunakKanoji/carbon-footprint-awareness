import { z } from 'zod';

import { NextResponse } from 'next/server';

import { geocodePlace } from '@/src/server/location/openrouteservice.service';
import { getCurrentUser } from '@/src/lib/auth';

const schema = z.object({
  text: z.string().min(1),
  boundaryCountry: z.string().optional(),
  size: z.coerce.number().int().positive().max(10).optional(),
});

export async function GET(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid geocode query', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, results: await geocodePlace(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Geocode failed' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid geocode payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, results: await geocodePlace(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Geocode failed' }, { status: 400 });
  }
}
