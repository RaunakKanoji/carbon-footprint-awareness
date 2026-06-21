import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { AGRIBALYSE_PROVIDER } from '@/src/integrations/agribalyse/constants';

function delegate() {
  if (!prisma.foodFactorMapping) {
    throw new Error('FoodFactorMapping table is unavailable. Apply the Agribalyse migration and restart the dev server.');
  }
  return prisma.foodFactorMapping;
}

function factorDelegate() {
  if (!prisma.agribalyseFoodFactor) {
    throw new Error('AgribalyseFoodFactor table is unavailable. Apply the Agribalyse migration and restart the dev server.');
  }
  return prisma.agribalyseFoodFactor;
}

export async function saveFoodFactorMapping(input: {
  id?: string;
  appCategory: string;
  appActivityType?: string;
  openFoodFactsTag?: string | null;
  openFoodFactsCategory?: string | null;
  label: string;
  description?: string;
  agribalyseFoodFactorId?: string | null;
  agribalyseName?: string | null;
  agribalyseCode?: string | null;
  defaultQuantityKg?: number | null;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}) {
  if (input.agribalyseFoodFactorId) {
    const factor = await factorDelegate().findFirst({
      where: { id: input.agribalyseFoodFactorId, isActive: true },
      select: { id: true, name: true, agribalyseId: true, ciqualCode: true },
    });

    if (!factor) {
      throw new Error(
        `Agribalyse factor "${input.agribalyseFoodFactorId}" was not found. Search factors first and use a real AgribalyseFoodFactor id.`,
      );
    }
  }

  const data = {
    provider: AGRIBALYSE_PROVIDER,
    appCategory: input.appCategory,
    appActivityType: input.appActivityType,
    openFoodFactsTag: input.openFoodFactsTag,
    openFoodFactsCategory: input.openFoodFactsCategory,
    label: input.label,
    description: input.description,
    agribalyseFoodFactorId: input.agribalyseFoodFactorId,
    agribalyseName: input.agribalyseName,
    agribalyseCode: input.agribalyseCode,
    defaultQuantityKg: input.defaultQuantityKg,
    confidence: input.confidence ?? 'MEDIUM',
    isActive: input.isActive ?? true,
    metadata: input.metadata as Prisma.InputJsonValue | undefined,
  };

  if (input.id) return delegate().update({ where: { id: input.id }, data });
  return delegate().create({ data });
}

export async function listFoodFactorMappings() {
  return delegate().findMany({
    where: { provider: AGRIBALYSE_PROVIDER },
    include: { agribalyseFoodFactor: true },
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function deactivateFoodFactorMapping(id: string) {
  return delegate().update({ where: { id }, data: { isActive: false } });
}

export async function findFoodFactorMappingForTags(tags: string[]) {
  for (const tag of tags) {
    const mapping = await delegate().findFirst({
      where: {
        provider: AGRIBALYSE_PROVIDER,
        openFoodFactsTag: tag,
        isActive: true,
      },
      include: { agribalyseFoodFactor: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (mapping?.agribalyseFoodFactor) return mapping;
  }

  return delegate().findFirst({
    where: { provider: AGRIBALYSE_PROVIDER, appCategory: 'FOOD', isActive: true },
    include: { agribalyseFoodFactor: true },
    orderBy: { updatedAt: 'desc' },
  });
}
