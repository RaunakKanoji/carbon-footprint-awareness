import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { confirmAgribalyseImport } from '@/src/server/food/agribalyse-import.service';

const schema = z.object({
  jobId: z.string().min(1),
  version: z.string().min(1),
  columnMapping: z.object({
    agribalyseId: z.string().optional(),
    ciqualCode: z.string().optional(),
    foodCode: z.string().optional(),
    name: z.string().min(1),
    nameFr: z.string().optional(),
    nameEn: z.string().optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    groupName: z.string().optional(),
    climateChangeKgCo2ePerKg: z.string().min(1),
    unit: z.string().optional(),
  }),
  replaceExistingVersion: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!isAgribalysePlaygroundEnabled()) return NextResponse.json({ error: 'Developer API playground is disabled' }, { status: 403 });
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid import payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    return NextResponse.json(await confirmAgribalyseImport(parsed.data));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 400 });
  }
}
