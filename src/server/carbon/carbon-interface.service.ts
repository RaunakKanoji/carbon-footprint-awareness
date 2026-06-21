import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { createCarbonInterfaceCacheKey } from '@/src/integrations/carbon-interface/cache';
import { callCarbonInterface } from '@/src/integrations/carbon-interface/client';
import {
  CARBON_INTERFACE_ENDPOINTS,
  CARBON_INTERFACE_PROVIDER,
} from '@/src/integrations/carbon-interface/constants';
import { extractCo2eKgFromCarbonInterface } from '@/src/integrations/carbon-interface/normalize';
import {
  buildCarbonInterfaceElectricityPayload,
  buildCarbonInterfaceFlightPayload,
  buildCarbonInterfaceFuelPayload,
  buildCarbonInterfaceShippingPayload,
  buildCarbonInterfaceVehiclePayload,
} from '@/src/integrations/carbon-interface/payload-builders';
import type { NormalizedCarbonInterfaceEstimate } from '@/src/integrations/carbon-interface/types';

export async function estimateWithCarbonInterface({
  payload,
  useCache = true,
}: {
  payload: Record<string, unknown>;
  useCache?: boolean;
}): Promise<NormalizedCarbonInterfaceEstimate> {
  const cacheKey = createCarbonInterfaceCacheKey({
    provider: CARBON_INTERFACE_PROVIDER,
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
          provider: CARBON_INTERFACE_PROVIDER,
          endpoint: 'estimate',
          payload,
          response: cached.sourceResponse,
          fromCache: true,
        };
      }
    } catch (error) {
      console.error('Carbon Interface cache read failed', {
        provider: CARBON_INTERFACE_PROVIDER,
        endpoint: 'estimate',
        error,
      });
    }
  }

  const response = await callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.estimates,
    method: 'POST',
    payload,
  });
  const co2eKg = extractCo2eKgFromCarbonInterface(response);

  if (useCache) {
    try {
      await prisma.carbonEstimateCache.upsert({
        where: { cacheKey },
        create: {
          provider: CARBON_INTERFACE_PROVIDER,
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
      console.error('Carbon Interface cache write failed', {
        provider: CARBON_INTERFACE_PROVIDER,
        endpoint: 'estimate',
        error,
      });
    }
  }

  return {
    co2eKg,
    provider: CARBON_INTERFACE_PROVIDER,
    endpoint: 'estimate',
    payload,
    response,
    fromCache: false,
  };
}

export function estimateVehicleWithCarbonInterface(
  input: Parameters<typeof buildCarbonInterfaceVehiclePayload>[0],
) {
  return estimateWithCarbonInterface({
    payload: buildCarbonInterfaceVehiclePayload(input),
  });
}

export function estimateElectricityWithCarbonInterface(
  input: Parameters<typeof buildCarbonInterfaceElectricityPayload>[0],
) {
  return estimateWithCarbonInterface({
    payload: buildCarbonInterfaceElectricityPayload(input),
  });
}

export function estimateFlightWithCarbonInterface(
  input: Parameters<typeof buildCarbonInterfaceFlightPayload>[0],
) {
  return estimateWithCarbonInterface({
    payload: buildCarbonInterfaceFlightPayload(input),
  });
}

export function estimateShippingWithCarbonInterface(
  input: Parameters<typeof buildCarbonInterfaceShippingPayload>[0],
) {
  return estimateWithCarbonInterface({
    payload: buildCarbonInterfaceShippingPayload(input),
  });
}

export function estimateFuelCombustionWithCarbonInterface(
  input: Parameters<typeof buildCarbonInterfaceFuelPayload>[0],
) {
  return estimateWithCarbonInterface({
    payload: buildCarbonInterfaceFuelPayload(input),
  });
}

export async function getCarbonInterfaceVehicleMakes() {
  return callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.vehicleMakes,
    method: 'GET',
  });
}

export async function getCarbonInterfaceVehicleModels(makeId: string) {
  return callCarbonInterface({
    path: CARBON_INTERFACE_ENDPOINTS.vehicleModels(makeId),
    method: 'GET',
  });
}
