import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { isPlaceholderClimatiqActivityId } from '@/src/integrations/climatiq/factor-mappings';

function getFoodCarbonFactorMappingDelegate() {
  if (!prisma.foodCarbonFactorMapping) {
    throw new Error(
      'Food carbon factor mappings are unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.foodCarbonFactorMapping;
}

export async function saveFoodCarbonFactorMapping(input: {
  id?: string;
  provider: string;
  appCategory: string;
  openFoodFactsTag?: string | null;
  label: string;
  description?: string;
  climatiqActivityId?: string | null;
  climatiqFactorId?: string | null;
  climatiqDataVersion?: string | null;
  climatiqRegion?: string | null;
  agribalyseId?: string | null;
  manualCo2ePerKg?: number | null;
  unitType?: string;
  defaultWeightKg?: number | null;
  confidence?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}) {
  if (
    input.provider === 'CLIMATIQ' &&
    input.isActive !== false &&
    (!input.climatiqActivityId || isPlaceholderClimatiqActivityId(input.climatiqActivityId))
  ) {
    throw new Error('Active Climatiq food mappings require a real activity ID');
  }

  if (input.provider === 'MANUAL' && input.isActive !== false && !input.manualCo2ePerKg) {
    throw new Error('Active manual food mappings require manualCo2ePerKg');
  }

  const data = {
    provider: input.provider,
    appCategory: input.appCategory,
    openFoodFactsTag: input.openFoodFactsTag,
    label: input.label,
    description: input.description,
    climatiqActivityId: input.climatiqActivityId,
    climatiqFactorId: input.climatiqFactorId,
    climatiqDataVersion: input.climatiqDataVersion,
    climatiqRegion: input.climatiqRegion,
    agribalyseId: input.agribalyseId,
    manualCo2ePerKg: input.manualCo2ePerKg,
    unitType: input.unitType ?? 'Weight',
    defaultWeightKg: input.defaultWeightKg,
    confidence: input.confidence ?? 'MEDIUM',
    metadata: input.metadata as Prisma.InputJsonValue | undefined,
    isActive: input.isActive ?? true,
  };

  if (input.id) {
    return getFoodCarbonFactorMappingDelegate().update({ where: { id: input.id }, data });
  }

  return getFoodCarbonFactorMappingDelegate().create({ data });
}
