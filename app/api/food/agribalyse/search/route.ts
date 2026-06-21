import { NextResponse } from 'next/server';

import { searchAgribalyseFoodFactors } from '@/src/server/food/agribalyse-search.service';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const results = await searchAgribalyseFoodFactors({
    query: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    version: url.searchParams.get('version') ?? undefined,
    limit: Number(url.searchParams.get('limit') ?? 20),
  });

  return NextResponse.json({ results });
}
