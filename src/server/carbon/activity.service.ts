import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import { prisma } from '@/src/db/prisma';
import type { NormalizedCarbonInterfaceEstimate } from '@/src/integrations/carbon-interface/types';
import type { NormalizedClimatiqEstimate } from '@/src/integrations/climatiq/types';
import type { NormalizedCarbonEstimate } from '@/src/integrations/carbonsutra/types';

type ManualCarbonEstimate = {
  co2eKg: number;
  provider: 'MANUAL';
  endpoint: string;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};

type SaveCarbonActivityInput = {
  userId: string;
  category:
    | 'TRANSPORT'
    | 'ELECTRICITY'
    | 'FLIGHT'
    | 'FUEL'
    | 'HOTEL'
    | 'SHIPPING'
    | 'FOOD'
    | 'SHOPPING'
    | 'PRODUCT'
    | 'MATERIAL';
  activityType: string;
  quantityValue?: number;
  quantityUnit?: string;
  distanceValue?: number;
  distanceUnit?: string;
  energyValue?: number;
  energyUnit?: string;
  weightValue?: number;
  weightUnit?: string;
  moneyValue?: number;
  moneyUnit?: string;
  country?: string;
  region?: string;
  city?: string;
  note?: string;
  estimate:
    | NormalizedCarbonEstimate
    | NormalizedCarbonInterfaceEstimate
    | NormalizedClimatiqEstimate
    | ManualCarbonEstimate;
};

export async function saveCarbonActivity(input: SaveCarbonActivityInput) {
  const quantity =
    input.quantityValue ??
    input.distanceValue ??
    input.energyValue ??
    input.weightValue ??
    input.moneyValue ??
    1;
  const unit =
    input.quantityUnit ??
    input.distanceUnit ??
    input.energyUnit ??
    input.weightUnit ??
    input.moneyUnit ??
    'activity';

  const log = await prisma.activityLog.create({
    data: {
      userId: input.userId,
      category: input.category,
      subType: input.activityType,
      activityType: input.activityType,
      quantity,
      unit,
      quantityValue: input.quantityValue,
      quantityUnit: input.quantityUnit,
      distanceValue: input.distanceValue,
      distanceUnit: input.distanceUnit,
      energyValue: input.energyValue,
      energyUnit: input.energyUnit,
      weightValue: input.weightValue,
      weightUnit: input.weightUnit,
      moneyValue: input.moneyValue,
      moneyUnit: input.moneyUnit,
      country: input.country,
      region: input.region,
      city: input.city,
      co2eKg: input.estimate.co2eKg,
      provider: input.estimate.provider,
      sourceEndpoint: input.estimate.endpoint,
      sourcePayload: input.estimate.payload as Prisma.InputJsonValue,
      sourceResponse: input.estimate.response as Prisma.InputJsonValue,
      sourceFactorId:
        input.estimate.provider === 'CLIMATIQ' ? input.estimate.emissionFactor?.id : undefined,
      sourceActivityId:
        input.estimate.provider === 'CLIMATIQ'
          ? input.estimate.emissionFactor?.activityId
          : undefined,
      sourceDataset:
        input.estimate.provider === 'CLIMATIQ'
          ? input.estimate.emissionFactor?.dataset
          : undefined,
      sourceRegion:
        input.estimate.provider === 'CLIMATIQ'
          ? input.estimate.emissionFactor?.region
          : undefined,
      sourceYear:
        input.estimate.provider === 'CLIMATIQ'
          ? input.estimate.emissionFactor?.year
          : undefined,
      confidence: 'MEDIUM',
      calculationMethod: `${input.estimate.provider} API estimate`,
      note: input.note ?? null,
    },
  });

  await handleNewActivityLog(log);
  return log;
}
