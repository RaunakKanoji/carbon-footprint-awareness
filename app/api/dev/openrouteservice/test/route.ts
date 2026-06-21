import { z } from 'zod';

import { NextResponse } from 'next/server';

import { OpenRouteServiceRequestError } from '@/src/integrations/openrouteservice/client';
import { isOpenRouteServicePlaygroundEnabled, ORS_PROFILES } from '@/src/integrations/openrouteservice/constants';
import { parseGoogleMapsLink } from '@/src/integrations/openrouteservice/google-maps-parser';
import {
  compareRoutes,
  geocodePlace,
  getRouteDistance,
  getRouteMatrix,
  reverseGeocode,
} from '@/src/server/location/openrouteservice.service';
import { getCurrentUser } from '@/src/lib/auth';

const coordinateSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

const testSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('geocode'),
    text: z.string().min(1),
    boundaryCountry: z.string().optional(),
    size: z.coerce.number().int().positive().max(10).optional(),
  }),
  z.object({
    type: z.literal('reverseGeocode'),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
  z.object({
    type: z.literal('directions'),
    origin: coordinateSchema,
    destination: coordinateSchema,
    profile: z.enum(ORS_PROFILES).default('driving-car'),
    preference: z.enum(['fastest', 'shortest', 'recommended']).optional(),
    includeGeometry: z.boolean().optional(),
    useCache: z.boolean().optional().default(true),
  }),
  z.object({
    type: z.literal('matrix'),
    locations: z.array(coordinateSchema).min(2).max(25),
    profile: z.enum(ORS_PROFILES).default('driving-car'),
    metrics: z.array(z.enum(['distance', 'duration'])).optional(),
  }),
  z.object({
    type: z.literal('compare'),
    origin: coordinateSchema,
    destination: coordinateSchema,
    profiles: z.array(z.enum(ORS_PROFILES)).min(1).max(5),
  }),
  z.object({
    type: z.literal('importGoogleMapsLink'),
    url: z.string().url(),
  }),
]);

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const enabled = isOpenRouteServicePlaygroundEnabled();

  if (!enabled) {
    return NextResponse.json(
      { ok: false, error: 'Developer API playground is disabled' },
      { status: 403 },
    );
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = testSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid OpenRouteService test payload',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  try {
    if (payload.type === 'geocode') {
      const results = await geocodePlace(payload);
      return NextResponse.json({ ok: true, type: payload.type, results, rawResponse: results });
    }

    if (payload.type === 'reverseGeocode') {
      const results = await reverseGeocode(payload);
      return NextResponse.json({ ok: true, type: payload.type, results, rawResponse: results });
    }

    if (payload.type === 'directions') {
      const route = await getRouteDistance(payload);
      return NextResponse.json({ ok: true, type: payload.type, route, fromCache: route.fromCache, rawResponse: route.rawResponse });
    }

    if (payload.type === 'matrix') {
      const matrix = await getRouteMatrix(payload);
      return NextResponse.json({ ok: true, type: payload.type, matrix, rawResponse: matrix.rawResponse });
    }

    if (payload.type === 'compare') {
      const results = await compareRoutes(payload);
      return NextResponse.json({ ok: true, type: payload.type, results });
    }

    const parsedLink = parseGoogleMapsLink(payload.url);
    return NextResponse.json({ ok: true, type: payload.type, parsed: parsedLink });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        type: payload.type,
        error: error instanceof Error ? error.message : 'OpenRouteService test request failed',
        ...(error instanceof OpenRouteServiceRequestError
          ? {
              upstreamStatus: error.status,
              upstreamPath: error.path,
              upstreamMethod: error.method,
              upstreamResponse: error.response,
            }
          : {}),
      },
      { status: 400 },
    );
  }
}
