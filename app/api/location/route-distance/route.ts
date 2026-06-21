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

    // OpenRouteService uses [lng, lat].
    // Google/most UI usage often uses [lat, lng].
    const asLngLat = { lng: first, lat: second };
    const asLatLng = { lat: first, lng: second };

    if (isValidCoordinate(asLngLat)) return asLngLat;
    if (isValidCoordinate(asLatLng)) return asLatLng;

    return null;
  }

  if (!isRecord(input)) return null;

  const lat = toNumber(input.lat) ?? toNumber(input.latitude) ?? toNumber(input.y);

  const lng =
    toNumber(input.lng) ?? toNumber(input.lon) ?? toNumber(input.longitude) ?? toNumber(input.x);

  if (lat !== null && lng !== null) {
    const coordinate = { lat, lng };
    return isValidCoordinate(coordinate) ? coordinate : null;
  }

  const coordinates = input.coordinates ?? input.coordinate ?? input.coords ?? input.location;

  if (coordinates) {
    return normalizeCoordinate(coordinates);
  }

  return null;
}

function normalizeLocation(input: unknown): NormalizedLocation {
  const coordinate = normalizeCoordinate(input);

  if (coordinate) {
    return { coordinate };
  }

  if (typeof input === 'string' && input.trim()) {
    return { text: input.trim() };
  }

  if (isRecord(input)) {
    const textCandidates = [
      input.text,
      input.address,
      input.label,
      input.name,
      input.value,
      input.place,
      input.placeName,
      input.place_name,
    ];

    for (const candidate of textCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return { text: candidate.trim() };
      }
    }
  }

  return {};
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getRouteProfile(mode: unknown) {
  const normalizedMode = typeof mode === 'string' ? mode.toLowerCase() : '';

  if (normalizedMode.includes('walk') || normalizedMode.includes('foot')) {
    return 'foot-walking';
  }

  if (
    normalizedMode.includes('bicycle') ||
    normalizedMode.includes('cycle') ||
    normalizedMode === 'bike'
  ) {
    return 'cycling-regular';
  }

  return 'driving-car';
}

function getRoadMultiplier(profile: string) {
  if (profile === 'foot-walking') return 1.2;
  if (profile === 'cycling-regular') return 1.25;
  return 1.35;
}

function haversineKm(origin: Coordinate, destination: Coordinate) {
  const radiusKm = 6371;

  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;

  const originLatRad = (origin.lat * Math.PI) / 180;
  const destinationLatRad = (destination.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLatRad) * Math.cos(destinationLatRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radiusKm * c;
}

function parseGoogleMapsCoordinates(url: string) {
  const pairs = Array.from(url.matchAll(/!1d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/g)).map(
    (match) => ({
      lng: Number.parseFloat(match[1]),
      lat: Number.parseFloat(match[2]),
    }),
  );

  const validPairs = pairs.filter(isValidCoordinate);

  if (validPairs.length >= 2) {
    return {
      origin: validPairs[0],
      destination: validPairs[validPairs.length - 1],
    };
  }

  return null;
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
    throw new Error(`OpenRouteService geocoding failed for "${text}". Status: ${response.status}`);
  }

  const coordinates = payload?.features?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error(`Could not geocode address: "${text}"`);
  }

  const lng = toNumber(coordinates[0]);
  const lat = toNumber(coordinates[1]);

  if (lat === null || lng === null) {
    throw new Error(`Invalid geocode result for address: "${text}"`);
  }

  const coordinate = { lat, lng };

  if (!isValidCoordinate(coordinate)) {
    throw new Error(`Invalid geocode coordinate for address: "${text}"`);
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
    throw new Error(
      `OpenRouteService directions failed. Status: ${response.status}. ${JSON.stringify(
        payload,
      ).slice(0, 400)}`,
    );
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
    throw new Error(
      `OpenRouteService returned no distance. Payload: ${JSON.stringify(payload).slice(0, 600)}`,
    );
  }

  return {
    distanceMeters,
    distanceKm: Number((distanceMeters / 1000).toFixed(2)),
    durationSeconds: durationSeconds ?? null,
    raw: payload,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body)) {
      return json(
        {
          ok: false,
          error: 'Invalid route payload',
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
      body.origin ?? body.from ?? body.start ?? body.source ?? body.originText ?? body.origin_text;

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
          error: 'Invalid route payload',
          details: {
            origin: ['Origin must be an address string or coordinates.'],
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
          error: 'Invalid route payload',
          details: {
            destination: ['Destination must be an address string or coordinates.'],
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

    const requestedMode = getString(body.mode ?? body.vehicleMode ?? body.vehicle) ?? '';
    const profile = getRouteProfile(requestedMode);

    if (requestedMode.toLowerCase().includes('flight')) {
      const distanceKm = Number(haversineKm(originCoordinate, destinationCoordinate).toFixed(2));

      return json({
        ok: true,
        provider: 'Carbon Compass great-circle distance',
        profile: 'flight',
        distanceKm,
        distance_km: distanceKm,
        distanceMeters: Number((distanceKm * 1000).toFixed(0)),
        distance_meters: Number((distanceKm * 1000).toFixed(0)),
        origin: {
          text: origin.text ?? null,
          coordinate: originCoordinate,
        },
        destination: {
          text: destination.text ?? null,
          coordinate: destinationCoordinate,
        },
        confidence: 'High',
      });
    }

    if (!apiKey) {
      const straightLineKm = haversineKm(originCoordinate, destinationCoordinate);
      const distanceKm = Number((straightLineKm * getRoadMultiplier(profile)).toFixed(2));

      return json({
        ok: true,
        provider: 'Carbon Compass fallback distance engine',
        profile,
        distanceKm,
        distance_km: distanceKm,
        distanceMeters: Number((distanceKm * 1000).toFixed(0)),
        distance_meters: Number((distanceKm * 1000).toFixed(0)),
        origin: {
          text: origin.text ?? null,
          coordinate: originCoordinate,
        },
        destination: {
          text: destination.text ?? null,
          coordinate: destinationCoordinate,
        },
        confidence: 'Medium',
      });
    }

    try {
      const route = await getDirectionsDistance({
        origin: originCoordinate,
        destination: destinationCoordinate,
        profile,
        apiKey,
      });

      return json({
        ok: true,
        provider: 'OpenRouteService',
        profile,
        distanceKm: route.distanceKm,
        distance_km: route.distanceKm,
        distanceMeters: route.distanceMeters,
        distance_meters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
        duration_seconds: route.durationSeconds,
        origin: {
          text: origin.text ?? null,
          coordinate: originCoordinate,
        },
        destination: {
          text: destination.text ?? null,
          coordinate: destinationCoordinate,
        },
        confidence: 'High',
      });
    } catch (directionsError) {
      const straightLineKm = haversineKm(originCoordinate, destinationCoordinate);
      const distanceKm = Number((straightLineKm * getRoadMultiplier(profile)).toFixed(2));

      return json({
        ok: true,
        provider: 'Carbon Compass fallback distance engine',
        profile,
        distanceKm,
        distance_km: distanceKm,
        distanceMeters: Number((distanceKm * 1000).toFixed(0)),
        distance_meters: Number((distanceKm * 1000).toFixed(0)),
        origin: {
          text: origin.text ?? null,
          coordinate: originCoordinate,
        },
        destination: {
          text: destination.text ?? null,
          coordinate: destinationCoordinate,
        },
        confidence: 'Medium',
        warning:
          directionsError instanceof Error
            ? directionsError.message
            : 'OpenRouteService directions failed, fallback distance used.',
      });
    }
  } catch (error) {
    return json(
      {
        ok: false,
        error: 'Route distance calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
