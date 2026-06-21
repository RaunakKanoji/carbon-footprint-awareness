import { z } from 'zod';

import { NextResponse } from 'next/server';

import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { searchClimatiqEmissionFactors } from '@/src/server/carbon/climatiq.service';
import { getCurrentUser } from '@/src/lib/auth';

const searchSchema = z.object({
  data_version: z.string().optional(),
  query: z.string().optional(),
  activity_id: z.string().optional(),
  id: z.string().optional(),
  category: z.string().optional(),
  sector: z.string().optional(),
  source: z.string().optional(),
  source_dataset: z.string().optional(),
  year: z.coerce.number().int().optional(),
  region: z.string().optional(),
  unit_type: z.string().optional(),
  source_lca_activity: z.string().optional(),
  calculation_method: z.enum(['ar4', 'ar5', 'ar6']).optional(),
  allowed_data_quality_flags: z.string().optional(),
  access_type: z.enum(['public', 'private', 'premium']).optional(),
  page: z.coerce.number().int().positive().optional(),
  results_per_page: z.coerce.number().int().positive().max(100).optional(),
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

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid search filters', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, filters: parsed.data, rawResponse: await searchClimatiqEmissionFactors(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Climatiq search failed' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = searchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid search filters', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, filters: parsed.data, rawResponse: await searchClimatiqEmissionFactors(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Climatiq search failed' }, { status: 400 });
  }
}
