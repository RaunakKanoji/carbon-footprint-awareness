import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { deleteProductScan, recordProductScan } from '@/src/server/products/product-scan.service';

const scanSchema = z.object({
  barcode: z.string().min(1),
  scanSource: z.enum(['BARCODE', 'MANUAL', 'SEARCH', 'RECEIPT']).optional(),
  scanContext: z.enum(['MEAL_LOG', 'SHOPPING', 'PANTRY', 'RECEIPT', 'POINT_OF_PURCHASE']).optional(),
});

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = scanSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid scan payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await recordProductScan({ userId: dbUser.id, ...parsed.data }));
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not look up this product right now. Please try again or enter the barcode manually.',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const scanId = new URL(req.url).searchParams.get('id');
  if (!scanId) {
    return NextResponse.json({ success: false, error: 'Missing scan id' }, { status: 400 });
  }

  await deleteProductScan({ userId: dbUser.id, scanId });
  return NextResponse.json({ success: true });
}
