import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import type { AgribalyseEstimateResult } from '@/src/integrations/agribalyse/types';

export async function saveAgribalyseFoodActivity(input: {
  userId: string;
  factor: {
    id: string;
    name: string;
    agribalyseId?: string | null;
    ciqualCode?: string | null;
    version?: string | null;
  };
  estimate: AgribalyseEstimateResult;
  quantityKg: number;
  sourcePayload: Record<string, unknown>;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  sourceContext?: string;
}) {
  if (input.estimate.status !== 'ESTIMATED' || !input.estimate.co2eKg) return null;

  const log = await prisma.activityLog.create({
    data: {
      userId: input.userId,
      category: 'FOOD',
      subType: input.factor.name,
      activityType: input.factor.name,
      quantity: input.quantityKg,
      unit: 'kg',
      weightValue: input.quantityKg,
      weightUnit: 'kg',
      co2eKg: input.estimate.co2eKg,
      provider: 'AGRIBALYSE',
      sourceEndpoint: 'agribalyse_local_dataset',
      sourcePayload: input.sourcePayload as Prisma.InputJsonValue,
      sourceResponse: { factor: input.factor, estimate: input.estimate } as Prisma.InputJsonValue,
      sourceFactorId: input.factor.id,
      sourceActivityId: input.factor.agribalyseId || input.factor.ciqualCode || undefined,
      sourceDataset: 'AGRIBALYSE',
      confidence: input.confidence ?? input.estimate.confidence,
      calculationMethod: 'food_lca_quantity_based',
      note: input.sourceContext ? `Agribalyse food estimate: ${input.sourceContext}` : 'Agribalyse food estimate',
    },
  });

  await handleNewActivityLog(log);
  return log;
}
