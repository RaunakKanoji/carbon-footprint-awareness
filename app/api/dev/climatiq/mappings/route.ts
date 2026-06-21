import { z } from 'zod';

import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { saveEmissionFactorMapping } from '@/src/server/carbon/climatiq.service';
import { getCurrentUser } from '@/src/lib/auth';

const mappingSchema = z.object({
  id: z.string().optional(),
  appCategory: z.string().min(1),
  appActivityType: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  climatiqFactorId: z.string().optional(),
  climatiqActivityId: z.string().min(1),
  climatiqDataVersion: z.string().optional(),
  climatiqRegion: z.string().optional(),
  climatiqYear: z.coerce.number().int().optional(),
  climatiqSource: z.string().optional(),
  climatiqDataset: z.string().optional(),
  unitType: z.string().optional(),
  defaultParameters: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
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

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const mappings = await prisma.emissionFactorMapping.findMany({
    where: { provider: 'CLIMATIQ' },
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ ok: true, mappings });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = mappingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid mapping payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, mapping: await saveEmissionFactorMapping(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Could not save mapping' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = mappingSchema.extend({ id: z.string().min(1) }).safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid mapping payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, mapping: await saveEmissionFactorMapping(parsed.data) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Could not update mapping' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing mapping id' }, { status: 400 });
  }

  const mapping = await prisma.emissionFactorMapping.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true, mapping });
}
