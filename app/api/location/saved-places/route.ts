import { z } from 'zod';

import { NextResponse } from 'next/server';

import {
  createSavedPlace,
  deleteSavedPlace,
  listSavedPlaces,
  updateSavedPlace,
} from '@/src/server/location/saved-place.service';
import { getCurrentUser } from '@/src/lib/auth';

const placeSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  name: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  source: z.string().default('MANUAL'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, places: await listSavedPlaces(dbUser.id) });
}

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = placeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid place payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json({ ok: true, place: await createSavedPlace({ userId: dbUser.id, ...parsed.data }) });
}

export async function PATCH(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = placeSchema.extend({ id: z.string().min(1) }).safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid place payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, ...data } = parsed.data;
  return NextResponse.json({ ok: true, place: await updateSavedPlace(dbUser.id, id, data) });
}

export async function DELETE(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'Missing place id' }, { status: 400 });

  return NextResponse.json({ ok: true, place: await deleteSavedPlace(dbUser.id, id) });
}
