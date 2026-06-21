import { z } from 'zod';
import { NextResponse } from 'next/server';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import {
  activityEstimatePersistenceData,
  estimateActivityCarbon,
  toActivityCategory,
} from '@/src/server/carbon/activity-estimation.service';

const schema = z.object({
  receiptType: z.string().min(1),
  filename: z.string().optional(),
  category: z.enum(['TRANSPORT', 'FOOD', 'ENERGY', 'SHOPPING', 'WASTE']),
  subType: z.string().min(1),
  quantity: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid receipt review', details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const estimate = await estimateActivityCarbon(parsed.data);
  const activity = await prisma.activityLog.create({
    data: {
      userId: user.id,
      category: toActivityCategory(parsed.data.category),
      subType: parsed.data.subType,
      activityType: parsed.data.subType,
      quantity: parsed.data.quantity,
      unit: estimate.unit,
      co2eKg: estimate.co2eKg,
      note: parsed.data.notes,
      ...activityEstimatePersistenceData(estimate),
    },
  });
  const receipt = await prisma.receiptUpload.create({
    data: {
      userId: user.id,
      receiptType: parsed.data.receiptType,
      filename: parsed.data.filename,
      status: 'SAVED',
      reviewedData: parsed.data as Prisma.InputJsonValue,
      activityLogIds: [activity.id],
    },
  });
  await handleNewActivityLog(activity);
  return NextResponse.json({ success: true, receiptId: receipt.id, activityId: activity.id, estimate });
}
