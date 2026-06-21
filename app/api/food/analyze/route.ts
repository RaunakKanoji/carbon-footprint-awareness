import { z } from 'zod';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { analyzeFood, saveFoodAnalysis } from '@/src/server/food/food-analysis.service';

const schema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('POPULAR'),
    catalogItemId: z.string().min(1),
    servings: z.coerce.number().positive().default(1),
    createActivityLog: z.boolean().optional(),
    occurredAt: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    mode: z.literal('BARCODE'),
    barcode: z.string().min(8),
    quantityKg: z.coerce.number().positive().optional(),
    createActivityLog: z.boolean().optional(),
    occurredAt: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    mode: z.literal('RECENT'),
    foodLogId: z.string().min(1),
    servings: z.coerce.number().positive().default(1),
    createActivityLog: z.boolean().optional(),
    occurredAt: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    mode: z.literal('AI'),
    description: z.string().min(3).max(1000),
    servings: z.coerce.number().positive().default(1),
    createActivityLog: z.boolean().optional(),
    occurredAt: z.string().optional(),
    note: z.string().optional(),
  }),
]);

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid food analysis request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const data = parsed.data;
    const result =
      data.mode === 'RECENT'
        ? await analyzeFood({ ...data, userId: user.id })
        : await analyzeFood(data);
    const saved = data.createActivityLog
      ? await saveFoodAnalysis({
          userId: user.id,
          result,
          occurredAt: data.occurredAt ? new Date(data.occurredAt) : undefined,
          note: data.note,
        })
      : null;
    return NextResponse.json({ ok: true, result, saved });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Food analysis failed' },
      { status: 400 },
    );
  }
}
