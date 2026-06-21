import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { getRecentFoodLogs } from '@/src/server/food/food-analysis.service';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, foods: await getRecentFoodLogs(user.id) });
}
