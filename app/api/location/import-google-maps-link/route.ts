import { z } from 'zod';

import { NextResponse } from 'next/server';

import { parseGoogleMapsLink } from '@/src/integrations/openrouteservice/google-maps-parser';
import { getCurrentUser } from '@/src/lib/auth';

const schema = z.object({ url: z.string().url() });

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid Google Maps URL', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, parsed: parseGoogleMapsLink(parsed.data.url) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Import failed' }, { status: 400 });
  }
}
