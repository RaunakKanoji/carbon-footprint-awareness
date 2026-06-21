import { z } from 'zod';

import { NextResponse } from 'next/server';

import { searchOpenFoodFactsProducts } from '@/src/server/products/open-food-facts.service';

const searchSchema = z.object({
  query: z.string().min(3),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(25).optional(),
});

export async function POST(req: Request) {
  const parsed = searchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid search payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await searchOpenFoodFactsProducts(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Could not search products.' },
      { status: 400 },
    );
  }
}
