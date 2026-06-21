import { z } from 'zod';

import { NextResponse } from 'next/server';

import { isOpenFoodFactsPlaygroundEnabled } from '@/src/integrations/open-food-facts/constants';
import { getCurrentUser } from '@/src/lib/auth';
import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';

const schema = z.object({
  barcode: z.string().min(1),
  useCache: z.boolean().optional(),
});

async function guard() {
  if (!isOpenFoodFactsPlaygroundEnabled()) {
    return NextResponse.json({ ok: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid product payload', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { product, fromCache } = await getProductByBarcode(parsed.data);
    return NextResponse.json({
      ok: true,
      normalized: product,
      rawResponse: product.rawResponse,
      fromCache,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Product lookup failed' }, { status: 400 });
  }
}
