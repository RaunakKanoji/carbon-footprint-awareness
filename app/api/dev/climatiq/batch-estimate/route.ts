import { z } from 'zod';

import { NextResponse } from 'next/server';

import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { batchEstimateWithClimatiq } from '@/src/server/carbon/climatiq.service';
import { getCurrentUser } from '@/src/lib/auth';

const batchSchema = z.object({
  payload: z.array(z.record(z.string(), z.unknown())).min(1),
});

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  if (!isClimatiqPlaygroundEnabled()) {
    return NextResponse.json({ ok: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = batchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid Climatiq batch payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const estimate = await batchEstimateWithClimatiq({
      payload: {
        emission_factors: parsed.data.payload as never,
      },
    });
    return NextResponse.json({
      ok: true,
      normalized: estimate.normalized,
      payload: parsed.data.payload,
      rawResponse: estimate.response,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, payload: parsed.data.payload, error: error instanceof Error ? error.message : 'Climatiq batch estimate failed' }, { status: 400 });
  }
}
