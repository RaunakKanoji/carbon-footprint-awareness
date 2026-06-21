import { z } from 'zod';

import { NextResponse } from 'next/server';

import { ClimatiqRequestError } from '@/src/integrations/climatiq/client';
import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { estimateWithClimatiq } from '@/src/server/carbon/climatiq.service';
import { getCurrentUser } from '@/src/lib/auth';

const estimateSchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  useCache: z.boolean().optional().default(true),
});

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function guard() {
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

  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = estimateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid Climatiq estimate payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const estimate = await estimateWithClimatiq(parsed.data);
    return NextResponse.json({
      ok: true,
      normalized: { co2eKg: estimate.co2eKg },
      fromCache: estimate.fromCache,
      payload: estimate.payload,
      emissionFactor: estimate.emissionFactor,
      rawResponse: estimate.response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        payload: parsed.data.payload,
        error: error instanceof Error ? error.message : 'Climatiq estimate failed',
        ...(error instanceof ClimatiqRequestError
          ? {
              upstreamStatus: error.status,
              upstreamPath: error.path,
              upstreamResponse: error.response,
            }
          : {}),
      },
      { status: 400 },
    );
  }
}
