import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { estimateActivityCarbon } from '@/src/server/carbon/activity-estimation.service';
import { estimateProductCarbon } from '@/src/server/products/product-carbon.service';

const estimateSchema = z.union([
  z.object({
    barcode: z.string().min(1),
    quantityKg: z.coerce.number().positive().optional(),
    servings: z.coerce.number().positive().optional(),
    scanContext: z.string().optional(),
    createActivityLog: z.boolean().optional(),
  }),
  z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    quantity: z.coerce.number().positive().default(1),
  }),
]);

function mapProductCategory(value: string) {
  const category = value.toLowerCase();
  if (category.includes('cloth') || category.includes('fashion')) return 'clothingItem';
  if (
    category.includes('electronic') ||
    category.includes('headphone') ||
    category.includes('phone') ||
    category.includes('laptop')
  ) {
    return 'electronicsItem';
  }
  if (category.includes('online')) return 'onlineOrder';
  return 'onlineOrder';
}

export async function POST(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = estimateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid estimate payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    if ('name' in parsed.data) {
      const estimate = await estimateActivityCarbon({
        category: 'SHOPPING',
        subType: mapProductCategory(parsed.data.category),
        quantity: parsed.data.quantity,
        unit: 'item',
      });

      return NextResponse.json({
        status: 'ESTIMATED',
        estimate,
        message:
          'We could not find a verified product carbon footprint for this item. This estimate uses an average factor for the closest product category.',
        product: {
          productName: parsed.data.name,
          requestedCategory: parsed.data.category,
          mappedCategory: estimate.subType,
          metadataProvider: null,
        },
        fallbackNotice:
          'Exact product footprint unavailable. We estimated this using the closest product category.',
      });
    }

    const { result, product, activity, quantityKg, mapping } = await estimateProductCarbon({
      userId: dbUser.id,
      ...parsed.data,
    });

    return NextResponse.json({
      status: result.status,
      estimate: result.status === 'ESTIMATED' ? result : undefined,
      message: result.message,
      product,
      activity,
      quantityKg,
      mapping: mapping
        ? {
            id: mapping.id,
            provider: mapping.provider,
            label: mapping.label,
            confidence: mapping.confidence,
          }
        : undefined,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'We could not estimate this product. Please check the product details and try again.',
      },
      { status: 400 },
    );
  }
}
