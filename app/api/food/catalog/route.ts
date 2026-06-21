import { NextResponse } from 'next/server';

import { listPopularFoods } from '@/src/server/food/food-analysis.service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const foods = await listPopularFoods({
    query: url.searchParams.get('q') ?? undefined,
    dietType: url.searchParams.get('dietType') ?? undefined,
  });
  return NextResponse.json({ ok: true, foods });
}
