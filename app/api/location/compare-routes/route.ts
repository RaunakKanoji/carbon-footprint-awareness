import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Coordinate = {
  lat: number;
  lng: number;
};

type NormalizedLocation = {
  text?: string;
  coordinate?: Coordinate;
};

type RouteMode = {
  mode: string;
  label: string;
  profile: string;
  emissionFactorKgPerKm: number;
  roadMultiplier: number;
  confidence: 'High' | 'Medium';
  note?: string;
};

const ROUTE_MODES: RouteMode[] = [
  {
    mode: 'petrolCar',
    label: 'Petrol Car',
    profile: 'driving-car',
    emissionFactorKgPerKm: 0.192,
    roadMultiplier: 1.35,
    confidence: 'High',
  },
  {
    mode: 'dieselCar',
    label: 'Diesel Car',
    profile: 'driving-car',
    emissionFactorKgPerKm: 0.171,
    roadMultiplier: 1.35,
    confidence: 'High',
  },
  {
    mode: 'bus',
    label: 'Bus',
    profile: 'driving-car',
    emissionFactorKgPerKm: 0.105,
    roadMultiplier: 1.35,
    confidence: 'Medium',
    note: 'Public transport route distance is approximated using road distance.',
  },
  {
    mode: 'metro',
    label: 'Metro',
    profile: 'driving-car',
    emissionFactorKgPerKm: 0.035,
    roadMultiplier: 1.25,
    confidence: 'Medium',
    note: 'Metro route distance is approximated because transit routing is not available.',
  },
  {
    mode: 'train',
    label: 'Train',
    profile: 'driving-car',
    emissionFactorKgPerKm: 0.041,
    roadMultiplier: 1.25,
    confidence: 'Medium',
    note: 'Train route distance is approximated because rail routing is not available.',
  },
  {
    mode: 'bicycle',
    label: 'Bicycle',
    profile: 'cycling-regular',
    emissionFactorKgPerKm: 0,
    roadMultiplier: 1.25,
    confidence: 'High',
  },
  {
    mode: 'walking',
    label: 'Walking',
    profile: 'foot-walking',
    emissionFactorKgPerKm: 0,
    roadMultiplier: 1.2,
    confidence: 'High',
  },
];

function getOpenRouteServiceKey() {
  return (
    process.env.OPENROUTESERVICE_API_KEY ||
    process.env.OPEN_ROUTE_SERVICE_API_KEY ||
    process.env.ORS_API_KEY ||
    ''
  );
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function isValidCoordinate(coordinate: Coordinate) {
  return (
    Number.isFinite(coordinate.lat) &&
    Number.isFinite(coordinate.lng) &&
    coordinate.lat >= -90 &&
    coordinate.lat <= 90 &&
    coordinate.lng >= -180 &&
    coordinate.lng <= 180
  );
}

function normalizeCoordinate(input: unknown): Coordinate | null {
  if (!input) return null;

  if (Array.isArray(input) && input.length >= 2) {
    const first = toNumber(input[0]);
    const second = toNumber(input[1]);

    if (first === null || second === null) return null;

    const asLngLat = { lng: first, lat: second };
    const asLatLng = { lat: first, lng: second };

    if (isValidCoordinate(asLngLat)) return asLngLat;
    if (isValidCoordinate(asLatLng)) return asLatLng;

    return null;
  }

  if (!isRecord(input)) return null;

  const lat = toNumber(input.lat) ?? toNumber(input.latitude) ?? toNumber(input.y);
  const lng =
    toNumber(input.lng) ??
    toNumber(input.lon) ??
    toNumber(input.longitude) ??
    toNumber(input.x);

  if (lat !== null && lng !== null) {
    const coordinate = { lat, lng };
    return isValidCoordinate(coordinate) ? coordinate : null;
  }

  return normalizeCoordinate(input.coordinates ?? input.coordinate ?? input.coords ?? input.location);
}

function normalizeLocation(input: unknown): NormalizedLocation {
  const coordinate = normalizeCoordinate(input);

  if (coordinate) return { coordinate };

  if (typeof input === 'string' && input.trim()) {
    return { text: input.trim() };
  }

  if (isRecord(input)) {
    const candidates = [
      input.text,
      input.address,
      input.label,
      input.name,
      input.value,
      input.place,
      input.placeName,
      input.place_name,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return { text: candidate.trim() };
      }
    }
  }

  return {};
}

function parseGoogleMapsCoordinates(url: string) {
  const pairs = Array.from(
    url.matchAll(/!1d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/g),
  ).map((match) => ({
    lng: Number.parseFloat(match[1]),
    lat: Number.parseFloat(match[2]),
  }));

  const validPairs = pairs.filter(isValidCoordinate);

  if (validPairs.length >= 2) {
    return {
      origin: validPairs[0],
      destination: validPairs[validPairs.length - 1],
    };
  }

  return null;
}

function haversineKm(origin: Coordinate, destination: Coordinate) {
  const radiusKm = 6371;

  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;

  const originLatRad = (origin.lat * Math.PI) / 180;
  const destinationLatRad = (destination.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLatRad) *
    Math.cos(destinationLatRad) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radiusKm * c;
}

async function geocodeAddress(text: string, apiKey: string): Promise<Coordinate> {
  const url = new URL('https://api.openrouteservice.org/geocode/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('text', text);
  url.searchParams.set('size', '1');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`OpenRouteService geocoding failed for "${text}".`);
  }

  const coordinates = payload?.features?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error(`Could not geocode address: "${text}"`);
  }

  const lng = toNumber(coordinates[0]);
  const lat = toNumber(coordinates[1]);

  if (lat === null || lng === null) {
    throw new Error(`Invalid geocode result for "${text}"`);
  }

  const coordinate = { lat, lng };

  if (!isValidCoordinate(coordinate)) {
    throw new Error(`Invalid coordinate for "${text}"`);
  }

  return coordinate;
}

async function getDirectionsDistance({
  origin,
  destination,
  profile,
  apiKey,
}: {
  origin: Coordinate;
  destination: Coordinate;
  profile: string;
  apiKey: string;
}) {
  const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`OpenRouteService directions failed for ${profile}.`);
  }

  const distanceMeters =
    toNumber(payload?.routes?.[0]?.summary?.distance) ??
    toNumber(payload?.features?.[0]?.properties?.summary?.distance) ??
    toNumber(payload?.routes?.[0]?.segments?.[0]?.distance);

  const durationSeconds =
    toNumber(payload?.routes?.[0]?.summary?.duration) ??
    toNumber(payload?.features?.[0]?.properties?.summary?.duration) ??
    toNumber(payload?.routes?.[0]?.segments?.[0]?.duration);

  if (distanceMeters === null || distanceMeters <= 0) {
    throw new Error(`No distance returned for ${profile}.`);
  }

  return {
    distanceMeters,
    distanceKm: Number((distanceMeters / 1000).toFixed(2)),
    durationSeconds: durationSeconds ?? null,
  };
}

async function getDistanceForMode({
  mode,
  origin,
  destination,
  apiKey,
}: {
  mode: RouteMode;
  origin: Coordinate;
  destination: Coordinate;
  apiKey: string;
}) {
  if (apiKey) {
    try {
      const route = await getDirectionsDistance({
        origin,
        destination,
        profile: mode.profile,
        apiKey,
      });

      const co2eKg = Number((route.distanceKm * mode.emissionFactorKgPerKm).toFixed(2));

      return {
        mode: mode.mode,
        subType: mode.mode,
        label: mode.label,
        profile: mode.profile,
        distanceKm: route.distanceKm,
        distance_km: route.distanceKm,
        distanceMeters: route.distanceMeters,
        distance_meters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
        duration_seconds: route.durationSeconds,
        durationMinutes:
          route.durationSeconds === null ? null : Number((route.durationSeconds / 60).toFixed(0)),
        co2eKg,
        co2e_kg: co2eKg,
        emissionFactorKgPerKm: mode.emissionFactorKgPerKm,
        emission_factor_kg_per_km: mode.emissionFactorKgPerKm,
        source: 'OpenRouteService',
        confidence: mode.confidence,
        note: mode.note ?? null,
      };
    } catch (error) {
      const fallbackKm = Number(
        (haversineKm(origin, destination) * mode.roadMultiplier).toFixed(2),
      );
      const co2eKg = Number((fallbackKm * mode.emissionFactorKgPerKm).toFixed(2));

      return {
        mode: mode.mode,
        subType: mode.mode,
        label: mode.label,
        profile: mode.profile,
        distanceKm: fallbackKm,
        distance_km: fallbackKm,
        distanceMeters: Number((fallbackKm * 1000).toFixed(0)),
        distance_meters: Number((fallbackKm * 1000).toFixed(0)),
        durationSeconds: null,
        duration_seconds: null,
        durationMinutes: null,
        co2eKg,
        co2e_kg: co2eKg,
        emissionFactorKgPerKm: mode.emissionFactorKgPerKm,
        emission_factor_kg_per_km: mode.emissionFactorKgPerKm,
        source: 'Carbon Compass fallback distance engine',
        confidence: 'Medium',
        note:
          mode.note ??
          (error instanceof Error
            ? error.message
            : 'OpenRouteService failed, fallback distance used.'),
      };
    }
  }

  const fallbackKm = Number((haversineKm(origin, destination) * mode.roadMultiplier).toFixed(2));
  const co2eKg = Number((fallbackKm * mode.emissionFactorKgPerKm).toFixed(2));

  return {
    mode: mode.mode,
    subType: mode.mode,
    label: mode.label,
    profile: mode.profile,
    distanceKm: fallbackKm,
    distance_km: fallbackKm,
    distanceMeters: Number((fallbackKm * 1000).toFixed(0)),
    distance_meters: Number((fallbackKm * 1000).toFixed(0)),
    durationSeconds: null,
    duration_seconds: null,
    durationMinutes: null,
    co2eKg,
    co2e_kg: co2eKg,
    emissionFactorKgPerKm: mode.emissionFactorKgPerKm,
    emission_factor_kg_per_km: mode.emissionFactorKgPerKm,
    source: 'Carbon Compass fallback distance engine',
    confidence: 'Medium',
    note: mode.note ?? null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body)) {
      return json(
        {
          ok: false,
          error: 'Invalid compare routes payload',
          details: 'Request body must be a JSON object.',
        },
        400,
      );
    }

    const apiKey = getOpenRouteServiceKey();

    const googleMapsUrl =
      getString(body.googleMapsUrl) ||
      getString(body.google_maps_url) ||
      getString(body.rawUrl) ||
      getString(body.raw_url) ||
      getString(body.url);

    const parsedGoogleCoordinates = googleMapsUrl
      ? parseGoogleMapsCoordinates(googleMapsUrl)
      : null;

    const originInput =
      body.origin ??
      body.from ??
      body.start ??
      body.source ??
      body.originText ??
      body.origin_text;

    const destinationInput =
      body.destination ??
      body.to ??
      body.end ??
      body.target ??
      body.destinationText ??
      body.destination_text;

    let origin = normalizeLocation(originInput);
    let destination = normalizeLocation(destinationInput);

    if (parsedGoogleCoordinates) {
      origin = {
        ...origin,
        coordinate: origin.coordinate ?? parsedGoogleCoordinates.origin,
      };

      destination = {
        ...destination,
        coordinate: destination.coordinate ?? parsedGoogleCoordinates.destination,
      };
    }

    if (!origin.coordinate && !origin.text) {
      return json(
        {
          ok: false,
          error: 'Invalid compare routes payload',
          details: {
            origin: ['Origin must be an address string, Google Maps URL, or coordinates.'],
          },
          received: {
            origin: originInput ?? null,
          },
        },
        400,
      );
    }

    if (!destination.coordinate && !destination.text) {
      return json(
        {
          ok: false,
          error: 'Invalid compare routes payload',
          details: {
            destination: ['Destination must be an address string, Google Maps URL, or coordinates.'],
          },
          received: {
            destination: destinationInput ?? null,
          },
        },
        400,
      );
    }

    if (!apiKey && (!origin.coordinate || !destination.coordinate)) {
      return json(
        {
          ok: false,
          error: 'Missing OpenRouteService API key',
          details:
            'Address inputs need OPENROUTESERVICE_API_KEY, OPEN_ROUTE_SERVICE_API_KEY, or ORS_API_KEY for geocoding.',
        },
        500,
      );
    }

    const originCoordinate =
      origin.coordinate ?? (await geocodeAddress(origin.text as string, apiKey));

    const destinationCoordinate =
      destination.coordinate ?? (await geocodeAddress(destination.text as string, apiKey));

    const routes = await Promise.all(
      ROUTE_MODES.map((mode) =>
        getDistanceForMode({
          mode,
          origin: originCoordinate,
          destination: destinationCoordinate,
          apiKey,
        }),
      ),
    );

    return json({
      ok: true,
      provider: apiKey ? 'OpenRouteService' : 'Carbon Compass fallback distance engine',
      origin: {
        text: origin.text ?? null,
        coordinate: originCoordinate,
      },
      destination: {
        text: destination.text ?? null,
        coordinate: destinationCoordinate,
      },
      routes,
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: 'Route comparison failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}