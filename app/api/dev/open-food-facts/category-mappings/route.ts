import { z } from 'zod';

import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { isOpenFoodFactsPlaygroundEnabled } from '@/src/integrations/open-food-facts/constants';
import { getCurrentUser } from '@/src/lib/auth';
import { saveFoodCarbonFactorMapping } from '@/src/server/products/food-factor-mapping.service';

const mappingSchema = z.object({
  id: z.string().optional(),
  provider: z.enum(['CLIMATIQ', 'AGRIBALYSE', 'MANUAL']),
  appCategory: z.string().min(1),
  openFoodFactsTag: z.string().optional().nullable(),
  label: z.string().min(1),
  description: z.string().optional(),
  climatiqActivityId: z.string().optional().nullable(),
  climatiqFactorId: z.string().optional().nullable(),
  climatiqDataVersion: z.string().optional().nullable(),
  climatiqRegion: z.string().optional().nullable(),
  agribalyseId: z.string().optional().nullable(),
  manualCo2ePerKg: z.coerce.number().positive().optional().nullable(),
  unitType: z.string().optional(),
  defaultWeightKg: z.coerce.number().positive().optional().nullable(),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
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
  if (!isOpenFoodFactsPlaygroundEnabled()) {
    return NextResponse.json({ ok: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const adminEmails = getAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

function getFoodCarbonFactorMappingDelegate() {
  if (!prisma.foodCarbonFactorMapping) {
    throw new Error(
      'Food carbon factor mappings are unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.foodCarbonFactorMapping;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  try {
    const mappings = await getFoodCarbonFactorMappingDelegate().findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ ok: true, mappings });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not load mappings' },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = mappingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid mapping payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, mapping: await saveFoodCarbonFactorMapping(parsed.data) });
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
    return NextResponse.json({ ok: true, mapping: await saveFoodCarbonFactorMapping(parsed.data) });
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

  try {
    const mapping = await getFoodCarbonFactorMappingDelegate().update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true, mapping });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not update mapping' },
      { status: 400 },
    );
  }
}
