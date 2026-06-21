import { z } from 'zod';
import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { estimateActivityCarbon } from '@/src/server/carbon/activity-estimation.service';

const schema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  purchaseDate: z.string().optional(),
  condition: z.string().optional(),
  usageFrequency: z.string().optional(),
  expectedLifetimeMonths: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid product details' }, { status: 400 });
  const category = parsed.data.category.toLowerCase().includes('cloth') ? 'clothingItem' : 'electronicsItem';
  const estimate = await estimateActivityCarbon({ category: 'SHOPPING', subType: category, quantity: 1 });
  const product = await prisma.ownedProduct.create({
    data: {
      userId: user.id,
      ...parsed.data,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : undefined,
      estimatedFootprintKg: estimate.co2eKg,
      dataSource: estimate.sourceLabel,
      confidence: estimate.confidence,
    },
  });
  return NextResponse.json({ success: true, product });
}
