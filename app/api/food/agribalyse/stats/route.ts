import { NextResponse } from 'next/server';

import { getAgribalyseStats } from '@/src/server/food/agribalyse-search.service';

export async function GET() {
  return NextResponse.json(await getAgribalyseStats());
}
