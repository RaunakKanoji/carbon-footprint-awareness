import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { deactivateFoodFactorMapping, saveFoodFactorMapping } from '@/src/server/food/food-mapping.service';
import { listFoodFactorMappings } from '@/src/server/food/food-mapping.service';

async function guard() {
  if (!isAgribalysePlaygroundEnabled()) return NextResponse.json({ error: 'Developer API playground is disabled' }, { status: 403 });
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ mappings: await listFoodFactorMappings() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load mappings' },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ mapping: await saveFoodFactorMapping(await req.json()) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not create mapping' },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Missing mapping id' }, { status: 400 });
  try {
    return NextResponse.json({ mapping: await saveFoodFactorMapping(body) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not update mapping' },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing mapping id' }, { status: 400 });
  try {
    return NextResponse.json({ mapping: await deactivateFoodFactorMapping(id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not deactivate mapping' },
      { status: 400 },
    );
  }
}
