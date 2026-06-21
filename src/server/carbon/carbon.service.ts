import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { callCarbonSutra } from '@/src/integrations/carbonsutra/client';
import { getCarbonSutraEndpointPath } from '@/src/integrations/carbonsutra/endpoints';
import { createCarbonCacheKey } from '@/src/integrations/carbonsutra/cache';
import { extractCo2eKg } from '@/src/integrations/carbonsutra/normalize';
import {
  buildEcommerceShipmentPayload,
  buildElectricityPayload,
  buildFlightPayload,
  buildFreightPayload,
  buildFuelPayload,
  buildHotelPayload,
  buildVehicleModelPayload,
  buildVehicleTypePayload,
} from '@/src/integrations/carbonsutra/payload-builders';
import type {
  CarbonSutraEndpointKey,
  NormalizedCarbonEstimate,
} from '@/src/integrations/carbonsutra/types';

export async function estimateWithCarbonSutra({
  endpoint,
  payload,
  useCache = true,
}: {
  endpoint: CarbonSutraEndpointKey;
  payload: Record<string, unknown>;
  useCache?: boolean;
}): Promise<NormalizedCarbonEstimate> {
  const path = getCarbonSutraEndpointPath(endpoint);
  const cacheKey = createCarbonCacheKey({
    provider: 'CARBONSUTRA',
    endpoint,
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
          provider: 'CARBONSUTRA',
          endpoint,
          payload,
          response: cached.sourceResponse,
          fromCache: true,
        };
      }
    } catch (error) {
      console.error('CarbonSutra cache read failed', {
        provider: 'CARBONSUTRA',
        endpoint,
        error,
      });
    }
  }

  const response = await callCarbonSutra({ path, payload });
  const co2eKg = extractCo2eKg(response);

  if (useCache) {
    try {
      await prisma.carbonEstimateCache.upsert({
        where: { cacheKey },
        create: {
          provider: 'CARBONSUTRA',
          endpoint,
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
      console.error('CarbonSutra cache write failed', {
        provider: 'CARBONSUTRA',
        endpoint,
        error,
      });
    }
  }

  return {
    co2eKg,
    provider: 'CARBONSUTRA',
    endpoint,
    payload,
    response,
    fromCache: false,
  };
}

export function estimateCarbonWithCarbonSutra(input: {
  endpoint: CarbonSutraEndpointKey;
  payload: Record<string, unknown>;
  useCache?: boolean;
}) {
  return estimateWithCarbonSutra(input);
}

export function estimateVehicleByType(input: Parameters<typeof buildVehicleTypePayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'vehicleType',
    payload: buildVehicleTypePayload(input),
  });
}

export function estimateVehicleByModel(input: Parameters<typeof buildVehicleModelPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'vehicleModel',
    payload: buildVehicleModelPayload(input),
  });
}

export function estimateElectricity(input: Parameters<typeof buildElectricityPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'electricity',
    payload: buildElectricityPayload(input),
  });
}

export function estimateFlight(input: Parameters<typeof buildFlightPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'flight',
    payload: buildFlightPayload(input),
  });
}

export function estimateFuel(input: Parameters<typeof buildFuelPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'fuel',
    payload: buildFuelPayload(input),
  });
}

export function estimateHotel(input: Parameters<typeof buildHotelPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'hotel',
    payload: buildHotelPayload(input),
  });
}

export function estimateFreight(input: Parameters<typeof buildFreightPayload>[0]) {
  return estimateWithCarbonSutra({
    endpoint: 'freight',
    payload: buildFreightPayload(input),
  });
}

export function estimateEcommerceShipment(
  input: Parameters<typeof buildEcommerceShipmentPayload>[0],
) {
  return estimateWithCarbonSutra({
    endpoint: 'ecommerceShipment',
    payload: buildEcommerceShipmentPayload(input),
  });
}
