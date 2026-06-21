import type {
  NormalizedRouteResult,
  NormalizedGeocodeResult,
} from './types';
import type { OpenRouteServiceProfile } from './constants';

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
}

function firstRecord(value: unknown): Record<string, unknown> | undefined {
  return Array.isArray(value) ? asRecord(value[0]) : undefined;
}

function getRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  return asRecord(asRecord(value)?.[key]);
}

function getArray(value: unknown, key: string): unknown[] {
  const item = asRecord(value)?.[key];
  return Array.isArray(item) ? item : [];
}

export function normalizeDirectionsResponse({
  response,
  profile,
  fromCache = false,
}: {
  response: unknown;
  profile: OpenRouteServiceProfile;
  fromCache?: boolean;
}): NormalizedRouteResult {
  const responseRecord = asRecord(response);
  const route = firstRecord(responseRecord?.routes) ?? getRecord(firstRecord(responseRecord?.features), 'properties');
  const featureProperties = getRecord(firstRecord(responseRecord?.features), 'properties');
  const summary = getRecord(route, 'summary') ?? getRecord(featureProperties, 'summary');

  const distanceMeters = Number(summary?.distance);
  const durationSeconds = Number(summary?.duration);

  if (!Number.isFinite(distanceMeters)) {
    throw new Error(
      `Could not extract distance from OpenRouteService response: ${JSON.stringify(
        response,
      )}`,
    );
  }

  if (!Number.isFinite(durationSeconds)) {
    throw new Error(
      `Could not extract duration from OpenRouteService response: ${JSON.stringify(
        response,
      )}`,
    );
  }

  return {
    provider: 'OPENROUTESERVICE',
    profile,
    distanceMeters,
    distanceKm: distanceMeters / 1000,
    durationSeconds,
    durationMinutes: durationSeconds / 60,
    geometry: firstRecord(responseRecord?.features)?.geometry ?? firstRecord(responseRecord?.routes)?.geometry,
    bbox: responseRecord?.bbox ?? firstRecord(responseRecord?.routes)?.bbox,
    rawResponse: response,
    fromCache,
  };
}

export function normalizeGeocodeResponse(response: unknown): NormalizedGeocodeResult[] {
  const features = getArray(response, 'features');

  return features
    .map((feature): NormalizedGeocodeResult | null => {
      const featureRecord = asRecord(feature);
      const geometry = getRecord(featureRecord, 'geometry');
      const properties = getRecord(featureRecord, 'properties');
      const coordinates = geometry?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return null;
      }

      const lng = Number(coordinates[0]);
      const lat = Number(coordinates[1]);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      return {
        label: String(properties?.label ?? properties?.name ?? 'Unknown place'),
        name: properties?.name ? String(properties.name) : undefined,
        address: properties?.label ? String(properties.label) : undefined,
        lat,
        lng,
        confidence: properties?.confidence ? Number(properties.confidence) : undefined,
        raw: feature,
      };
    })
    .filter((item): item is NormalizedGeocodeResult => item !== null);
}
