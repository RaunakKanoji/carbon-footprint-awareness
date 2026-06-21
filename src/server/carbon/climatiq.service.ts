import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { createClimatiqCacheKey } from '@/src/integrations/climatiq/cache';
import { callClimatiq } from '@/src/integrations/climatiq/client';
import {
  CLIMATIQ_ENDPOINTS,
  CLIMATIQ_PROVIDER,
  DEFAULT_CLIMATIQ_DATA_VERSION,
} from '@/src/integrations/climatiq/constants';
import {
  DEFAULT_CLIMATIQ_MAPPINGS,
  isPlaceholderClimatiqActivityId,
  type AppEmissionMappingKey,
} from '@/src/integrations/climatiq/factor-mappings';
import {
  extractClimatiqEmissionFactorMetadata,
  normalizeClimatiqCo2eToKg,
} from '@/src/integrations/climatiq/normalize';
import {
  buildElectricityPayload,
  buildFuelPayload,
  buildProductWeightPayload,
  buildSpendBasedPayload,
  buildTransportDistancePayload,
} from '@/src/integrations/climatiq/payload-builders';
import { buildClimatiqSearchParams } from '@/src/integrations/climatiq/search-params';
import type {
  ClimatiqBatchEstimatePayload,
  ClimatiqEstimatePayload,
  ClimatiqSearchParams,
  NormalizedClimatiqEstimate,
} from '@/src/integrations/climatiq/types';

type MappingRecord = {
  label: string;
  appCategory: string;
  appActivityType: string;
  activityId: string;
  factorId?: string | null;
  dataVersion: string;
  region?: string | null;
  year?: number | null;
  source?: string | null;
  dataset?: string | null;
  unitType?: string | null;
  defaultParameters?: Prisma.JsonValue | null;
  metadata?: Prisma.JsonValue | null;
};

export async function searchClimatiqEmissionFactors(input: ClimatiqSearchParams) {
  return callClimatiq({
    path: CLIMATIQ_ENDPOINTS.search,
    method: 'GET',
    query: buildClimatiqSearchParams(input),
  });
}

export async function estimateWithClimatiq({
  payload,
  useCache = true,
}: {
  payload: Record<string, unknown>;
  useCache?: boolean;
}): Promise<NormalizedClimatiqEstimate> {
  const cacheKey = createClimatiqCacheKey({
    provider: CLIMATIQ_PROVIDER,
    endpoint: 'estimate',
    payload,
  });

  if (useCache) {
    try {
      const cached = await prisma.carbonEstimateCache.findUnique({
        where: { cacheKey },
      });

      if (cached) {
        return {
          co2eKg: cached.co2eKg,
          provider: CLIMATIQ_PROVIDER,
          endpoint: 'estimate',
          payload,
          response: cached.sourceResponse,
          fromCache: true,
          emissionFactor: extractClimatiqEmissionFactorMetadata(cached.sourceResponse),
        };
      }
    } catch (error) {
      console.error('Climatiq cache read failed', {
        provider: CLIMATIQ_PROVIDER,
        endpoint: 'estimate',
        error,
      });
    }
  }

  const response = await callClimatiq({
    path: CLIMATIQ_ENDPOINTS.estimate,
    method: 'POST',
    payload,
  });
  const co2eKg = normalizeClimatiqCo2eToKg(response);

  if (useCache) {
    try {
      await prisma.carbonEstimateCache.upsert({
        where: { cacheKey },
        create: {
          provider: CLIMATIQ_PROVIDER,
          endpoint: 'estimate',
          cacheKey,
          co2eKg,
          sourcePayload: payload as Prisma.InputJsonValue,
          sourceResponse: response as Prisma.InputJsonValue,
        },
        update: {
          co2eKg,
          sourcePayload: payload as Prisma.InputJsonValue,
          sourceResponse: response as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      console.error('Climatiq cache write failed', {
        provider: CLIMATIQ_PROVIDER,
        endpoint: 'estimate',
        error,
      });
    }
  }

  return {
    co2eKg,
    provider: CLIMATIQ_PROVIDER,
    endpoint: 'estimate',
    payload,
    response,
    fromCache: false,
    emissionFactor: extractClimatiqEmissionFactorMetadata(response),
  };
}

export async function batchEstimateWithClimatiq({
  payload,
}: {
  payload: ClimatiqBatchEstimatePayload;
}) {
  const response = await callClimatiq({
    path: CLIMATIQ_ENDPOINTS.batchEstimate,
    method: 'POST',
    payload: payload as unknown as Record<string, unknown>,
  });
  const items = Array.isArray(response) ? response : (response as { results?: unknown[] })?.results ?? [];

  return {
    provider: CLIMATIQ_PROVIDER,
    endpoint: 'batchEstimate' as const,
    payload,
    response,
    normalized: items.map((item) => ({
      co2eKg: normalizeClimatiqCo2eToKg(item),
      emissionFactor: extractClimatiqEmissionFactorMetadata(item),
    })),
  };
}

export async function getEmissionFactorMapping(mappingKey: string): Promise<MappingRecord> {
  const mapping = await prisma.emissionFactorMapping.findFirst({
    where: {
      provider: CLIMATIQ_PROVIDER,
      appActivityType: mappingKey,
      isActive: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (mapping) {
    if (isPlaceholderClimatiqActivityId(mapping.climatiqActivityId)) {
      throw new Error(`Climatiq mapping ${mappingKey} uses a placeholder activity ID`);
    }

    return {
      label: mapping.label,
      appCategory: mapping.appCategory,
      appActivityType: mapping.appActivityType,
      activityId: mapping.climatiqActivityId ?? '',
      factorId: mapping.climatiqFactorId,
      dataVersion: mapping.climatiqDataVersion,
      region: mapping.climatiqRegion,
      year: mapping.climatiqYear,
      source: mapping.climatiqSource,
      dataset: mapping.climatiqDataset,
      unitType: mapping.unitType,
      defaultParameters: mapping.defaultParameters,
      metadata: mapping.metadata,
    };
  }

  const fallback = DEFAULT_CLIMATIQ_MAPPINGS[mappingKey as AppEmissionMappingKey];
  if (!fallback) {
    throw new Error(`Missing Climatiq emission factor mapping: ${mappingKey}`);
  }

  if (isPlaceholderClimatiqActivityId(fallback.activityId)) {
    throw new Error(`Climatiq mapping ${mappingKey} has not been configured with a real activity ID`);
  }

  return {
    label: fallback.label,
    appCategory: fallback.appCategory,
    appActivityType: fallback.appActivityType,
    activityId: fallback.activityId,
    dataVersion: fallback.dataVersion ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    region: fallback.region,
    unitType: fallback.unitType,
  };
}

export async function saveEmissionFactorMapping(input: {
  id?: string;
  appCategory: string;
  appActivityType: string;
  label: string;
  description?: string;
  climatiqFactorId?: string;
  climatiqActivityId: string;
  climatiqDataVersion?: string;
  climatiqRegion?: string;
  climatiqYear?: number;
  climatiqSource?: string;
  climatiqDataset?: string;
  unitType?: string;
  defaultParameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}) {
  if (input.isActive !== false && isPlaceholderClimatiqActivityId(input.climatiqActivityId)) {
    throw new Error('Cannot save placeholder Climatiq activity IDs as active mappings');
  }

  const data = {
    provider: CLIMATIQ_PROVIDER,
    appCategory: input.appCategory,
    appActivityType: input.appActivityType,
    label: input.label,
    description: input.description,
    climatiqFactorId: input.climatiqFactorId,
    climatiqActivityId: input.climatiqActivityId,
    climatiqDataVersion: input.climatiqDataVersion ?? DEFAULT_CLIMATIQ_DATA_VERSION,
    climatiqRegion: input.climatiqRegion,
    climatiqYear: input.climatiqYear,
    climatiqSource: input.climatiqSource,
    climatiqDataset: input.climatiqDataset,
    unitType: input.unitType,
    defaultParameters: input.defaultParameters as Prisma.InputJsonValue | undefined,
    metadata: input.metadata as Prisma.InputJsonValue | undefined,
    isActive: input.isActive ?? true,
  };

  if (input.id) {
    return prisma.emissionFactorMapping.update({
      where: { id: input.id },
      data,
    });
  }

  return prisma.emissionFactorMapping.create({ data });
}

function selectorFromMapping(mapping: MappingRecord) {
  return {
    activity_id: mapping.activityId,
    id: mapping.factorId ?? undefined,
    data_version: mapping.dataVersion,
    region: mapping.region ?? undefined,
    year: mapping.year ?? undefined,
    source: mapping.source ?? undefined,
    source_dataset: mapping.dataset ?? undefined,
  };
}

export async function estimateTransportWithClimatiq(input: {
  mappingKey: string;
  distanceValue: number;
  distanceUnit: 'm' | 'km' | 'mi';
}) {
  const mapping = await getEmissionFactorMapping(input.mappingKey);
  return estimateWithClimatiq({
    payload: buildTransportDistancePayload({
      activityId: mapping.activityId,
      dataVersion: mapping.dataVersion,
      region: mapping.region ?? undefined,
      distanceValue: input.distanceValue,
      distanceUnit: input.distanceUnit,
    }) as unknown as Record<string, unknown>,
  });
}

export async function estimateElectricityWithClimatiq(input: {
  mappingKey: string;
  energyValue: number;
  energyUnit: 'Wh' | 'kWh' | 'MWh';
}) {
  const mapping = await getEmissionFactorMapping(input.mappingKey);
  return estimateWithClimatiq({
    payload: buildElectricityPayload({
      activityId: mapping.activityId,
      dataVersion: mapping.dataVersion,
      region: mapping.region ?? undefined,
      energyValue: input.energyValue,
      energyUnit: input.energyUnit,
    }) as unknown as Record<string, unknown>,
  });
}

export async function estimateFuelWithClimatiq(input: {
  mappingKey: string;
  volumeValue?: number;
  volumeUnit?: string;
  energyValue?: number;
  energyUnit?: 'Wh' | 'kWh' | 'MWh' | 'MJ' | 'GJ';
  weightValue?: number;
  weightUnit?: 'g' | 'kg' | 't' | 'lb';
}) {
  const mapping = await getEmissionFactorMapping(input.mappingKey);
  return estimateWithClimatiq({
    payload: buildFuelPayload({
      activityId: mapping.activityId,
      dataVersion: mapping.dataVersion,
      region: mapping.region ?? undefined,
      volumeValue: input.volumeValue,
      volumeUnit: input.volumeUnit,
      energyValue: input.energyValue,
      energyUnit: input.energyUnit,
      weightValue: input.weightValue,
      weightUnit: input.weightUnit,
    }) as unknown as Record<string, unknown>,
  });
}

export async function estimateSpendWithClimatiq(input: {
  mappingKey: string;
  moneyValue: number;
  moneyUnit: string;
  spentYear?: number;
}) {
  const mapping = await getEmissionFactorMapping(input.mappingKey);
  return estimateWithClimatiq({
    payload: buildSpendBasedPayload({
      activityId: mapping.activityId,
      dataVersion: mapping.dataVersion,
      region: mapping.region ?? undefined,
      moneyValue: input.moneyValue,
      moneyUnit: input.moneyUnit,
      spentYear: input.spentYear,
    }) as unknown as Record<string, unknown>,
  });
}

export async function estimateProductWeightWithClimatiq(input: {
  mappingKey: string;
  weightValue: number;
  weightUnit: 'g' | 'kg' | 't' | 'lb';
}) {
  const mapping = await getEmissionFactorMapping(input.mappingKey);
  return estimateWithClimatiq({
    payload: buildProductWeightPayload({
      activityId: mapping.activityId,
      dataVersion: mapping.dataVersion,
      region: mapping.region ?? undefined,
      weightValue: input.weightValue,
      weightUnit: input.weightUnit,
    }) as unknown as Record<string, unknown>,
  });
}

export function buildClimatiqEstimateFromMapping({
  mapping,
  parameters,
}: {
  mapping: MappingRecord;
  parameters: Record<string, unknown>;
}): ClimatiqEstimatePayload {
  return {
    emission_factor: selectorFromMapping(mapping),
    parameters,
  };
}
