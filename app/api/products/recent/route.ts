import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { getRecentProductScans } from '@/src/server/products/product-scan.service';

export async function GET(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Number(new URL(req.url).searchParams.get('limit') ?? 10);
  const scans = await getRecentProductScans(dbUser.id, Math.min(50, Math.max(1, limit)));
  return NextResponse.json({ scans });
}
