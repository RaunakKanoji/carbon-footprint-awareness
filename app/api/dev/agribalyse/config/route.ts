import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { DEFAULT_AGRIBALYSE_VERSION, AGRIBALYSE_SOURCE_NAME, isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { getAgribalyseStats } from '@/src/server/food/agribalyse-search.service';

async function guard() {
  if (!isAgribalysePlaygroundEnabled()) {
    return NextResponse.json({ enabled: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ enabled: true, error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const stats = await getAgribalyseStats();
  return NextResponse.json({
    enabled: true,
    dataVersion: DEFAULT_AGRIBALYSE_VERSION,
    sourceName: AGRIBALYSE_SOURCE_NAME,
    totalFactors: stats.totalFactors,
    activeFactors: stats.activeFactors,
    hasImportedData: stats.hasImportedData,
    lastImport: stats.lastImport,
  });
}
