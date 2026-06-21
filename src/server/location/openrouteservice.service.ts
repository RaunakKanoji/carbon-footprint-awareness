import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { callOpenRouteService } from '@/src/integrations/openrouteservice/client';
import {
  OPENROUTESERVICE_PROVIDER,
  ORS_ENDPOINTS,
  type OpenRouteServiceProfile,
} from '@/src/integrations/openrouteservice/constants';
import {
  createOpenRouteServiceCacheKey,
} from '@/src/integrations/openrouteservice/cache';
import {
  buildDirectionsPayload,
  buildMatrixPayload,
} from '@/src/integrations/openrouteservice/payload-builders';
import {
  normalizeDirectionsResponse,
  normalizeGeocodeResponse,
} from '@/src/integrations/openrouteservice/normalize';
import type {
  Coordinate,
  GeocodeInput,
  ReverseGeocodeInput,
  RouteDistanceInput,
  RouteMatrixInput,
  NormalizedRouteResult,
} from '@/src/integrations/openrouteservice/types';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

function firstRecord(value: unknown): Record<string, unknown> | undefined {
  return Array.isArray(value) ? asRecord(value[0]) : undefined;
}

function getCachedRouteResponseDetails(response: unknown) {
  const responseRecord = asRecord(response);
  const feature = firstRecord(responseRecord?.features);
  const route = firstRecord(responseRecord?.routes);

  return {
    geometry: asRecord(feature)?.geometry ?? route?.geometry,
    bbox: responseRecord?.bbox ?? route?.bbox,
  };
}

export async function geocodePlace(input: GeocodeInput) {
  const query: Record<string, string | number | boolean | undefined> = {
    text: input.text,
    ...(input.boundaryCountry ? { 'boundary.country': input.boundaryCountry } : {}),
    ...(input.size ? { size: input.size } : {}),
  };

  const response = await callOpenRouteService({
    path: ORS_ENDPOINTS.geocode,
    method: 'GET',
    query,
  });

  return normalizeGeocodeResponse(response);
}

export async function reverseGeocode(input: ReverseGeocodeInput) {
  const query: Record<string, string | number | boolean | undefined> = {
    'point.lat': input.lat,
    'point.lon': input.lng,
  };

  const response = await callOpenRouteService({
    path: ORS_ENDPOINTS.reverseGeocode,
    method: 'GET',
    query,
  });

  return normalizeGeocodeResponse(response);
}

export async function getRouteDistance(
  input: RouteDistanceInput & { useCache?: boolean }
): Promise<NormalizedRouteResult> {
  const useCache = input.useCache ?? true;
  const payload = buildDirectionsPayload(input);
  const cacheKey = createOpenRouteServiceCacheKey({
    provider: OPENROUTESERVICE_PROVIDER,
    endpoint: 'directions',
    profile: input.profile,
    payload,
  });

  if (useCache) {
    try {
      const cached = await prisma.routeEstimateCache.findUnique({
        where: { cacheKey },
      });

      const now = new Date();
      if (cached && (!cached.expiresAt || cached.expiresAt > now)) {
        const responseDetails = getCachedRouteResponseDetails(cached.sourceResponse);
        return {
          provider: 'OPENROUTESERVICE',
          profile: input.profile,
          distanceMeters: cached.distanceMeters ?? 0,
          distanceKm: cached.distanceKm ?? 0,
          durationSeconds: cached.durationSeconds ?? 0,
          durationMinutes: cached.durationMinutes ?? 0,
          geometry: responseDetails.geometry,
          bbox: responseDetails.bbox,
          rawResponse: cached.sourceResponse,
          fromCache: true,
        };
      }
    } catch (error) {
      console.error('Route distance cache read failed', error);
    }
  }

  const response = await callOpenRouteService({
    path: ORS_ENDPOINTS.directions(input.profile),
    method: 'POST',
    payload: payload as unknown as Record<string, unknown>,
  });

  const normalized = normalizeDirectionsResponse({
    response,
    profile: input.profile,
    fromCache: false,
  });

  if (useCache) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Cache for 7 days

      await prisma.routeEstimateCache.upsert({
        where: { cacheKey },
        create: {
          provider: OPENROUTESERVICE_PROVIDER,
          endpoint: 'directions',
          cacheKey,
          distanceMeters: normalized.distanceMeters,
          distanceKm: normalized.distanceKm,
          durationSeconds: normalized.durationSeconds,
          durationMinutes: normalized.durationMinutes,
          sourcePayload: payload as Prisma.InputJsonValue,
          sourceResponse: response as Prisma.InputJsonValue,
          expiresAt,
        },
        update: {
          distanceMeters: normalized.distanceMeters,
          distanceKm: normalized.distanceKm,
          durationSeconds: normalized.durationSeconds,
          durationMinutes: normalized.durationMinutes,
          sourcePayload: payload as Prisma.InputJsonValue,
          sourceResponse: response as Prisma.InputJsonValue,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('Route distance cache write failed', error);
    }
  }

  return normalized;
}

export async function getRouteMatrix(input: RouteMatrixInput) {
  const payload = buildMatrixPayload(input);

  // Matrix has no schema backing so we fetch dynamically without database cache storage for now
  const response = await callOpenRouteService({
    path: ORS_ENDPOINTS.matrix(input.profile),
    method: 'POST',
    payload: payload as unknown as Record<string, unknown>,
  });

  return {
    rawResponse: response,
    locations: input.locations,
    profile: input.profile,
  };
}

export async function compareRoutes(input: {
  origin: Coordinate;
  destination: Coordinate;
  profiles: OpenRouteServiceProfile[];
}) {
  const results = await Promise.all(
    input.profiles.map(async (profile) => {
      try {
        const route = await getRouteDistance({
          origin: input.origin,
          destination: input.destination,
          profile,
          preference: 'recommended',
          includeGeometry: false,
        });

        return {
          profile,
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          success: true as const,
        };
      } catch (error) {
        console.error(`Compare route failed for profile ${profile}:`, error);
        return {
          profile,
          distanceKm: 0,
          durationMinutes: 0,
          success: false as const,
          error: error instanceof Error ? error.message : 'Calculation failed',
        };
      }
    })
  );

  return results;
}
