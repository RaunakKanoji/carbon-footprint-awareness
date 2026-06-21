import 'server-only';

import { prisma } from '@/src/db/prisma';
import { DEFAULT_AGRIBALYSE_VERSION } from '@/src/integrations/agribalyse/constants';

function delegate() {
  if (!prisma.agribalyseFoodFactor) {
    throw new Error('Agribalyse tables are unavailable. Apply the Agribalyse migration and restart the dev server.');
  }
  return prisma.agribalyseFoodFactor;
}

export async function searchAgribalyseFoodFactors(input: {
  query?: string;
  category?: string;
  version?: string;
  limit?: number;
}) {
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const query = input.query?.trim();

  return delegate().findMany({
    where: {
      isActive: true,
      version: input.version || undefined,
      category: input.category ? { contains: input.category, mode: 'insensitive' } : undefined,
      OR: query
        ? [
            { name: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
            { nameFr: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: [{ version: 'desc' }, { name: 'asc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      nameEn: true,
      nameFr: true,
      category: true,
      subCategory: true,
      climateChangeKgCo2ePerKg: true,
      unit: true,
      source: true,
      version: true,
    },
  });
}

export async function getAgribalyseFoodFactorById(id: string) {
  return delegate().findFirst({ where: { id, isActive: true } });
}

export async function listAgribalyseCategories(version?: string) {
  const rows = await delegate().findMany({
    where: { isActive: true, version: version || undefined, category: { not: null } },
    distinct: ['category'],
    orderBy: { category: 'asc' },
    select: { category: true },
  });
  return rows.map((row) => row.category).filter(Boolean);
}

export async function getAgribalyseStats() {
  const [totalFactors, activeFactors, versions, categories, lastImport] = await Promise.all([
    delegate().count(),
    delegate().count({ where: { isActive: true } }),
    delegate().findMany({ distinct: ['version'], select: { version: true } }),
    listAgribalyseCategories(),
    prisma.agribalyseImportJob?.findFirst({ orderBy: { updatedAt: 'desc' } }) ?? null,
  ]);

  return {
    totalFactors,
    activeFactors,
    versions: versions.map((item) => item.version ?? DEFAULT_AGRIBALYSE_VERSION),
    categories,
    lastImport,
    hasImportedData: activeFactors > 0,
  };
}
