import { NextResponse } from 'next/server';

import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ barcode: string }> },
) {
  try {
    const { barcode } = await ctx.params;
    const result = await getProductByBarcode({ barcode });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not look up this product right now.',
      },
      { status: 400 },
    );
  }
}
