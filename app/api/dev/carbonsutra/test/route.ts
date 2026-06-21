import { z } from 'zod';

import { NextResponse } from 'next/server';

import {
  getCarbonSutraEndpointPath,
  isDevApiPlaygroundEnabled,
} from '@/src/integrations/carbonsutra/endpoints';
import { callCarbonSutra, CarbonSutraRequestError } from '@/src/integrations/carbonsutra/client';
import { createCarbonCacheKey } from '@/src/integrations/carbonsutra/cache';
import { extractCo2eKg } from '@/src/integrations/carbonsutra/normalize';
import type { CarbonSutraEndpointKey } from '@/src/integrations/carbonsutra/types';
import { estimateCarbonWithCarbonSutra } from '@/src/server/carbon/carbon.service';
import { getCurrentUser } from '@/src/lib/auth';

const testSchema = z.object({
  endpoint: z.enum([
    'vehicleType',
    'vehicleModel',
    'electricity',
    'flight',
    'fuel',
    'hotel',
    'freight',
    'ecommerceShipment',
  ]),
  payload: z.record(z.string(), z.unknown()),
  useCache: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const enabled = isDevApiPlaygroundEnabled();

  if (!enabled) {
    return NextResponse.json({ ok: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const parsed = testSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid CarbonSutra test payload',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { endpoint, payload, useCache } = parsed.data;

  try {
    if (useCache) {
      const estimate = await estimateCarbonWithCarbonSutra({
        endpoint: endpoint as CarbonSutraEndpointKey,
        payload,
        useCache,
      });

      return NextResponse.json({
        ok: true,
        endpoint,
        payload,
        normalized: { co2eKg: estimate.co2eKg },
        fromCache: estimate.fromCache,
        rawResponse: estimate.response,
      });
    }

    const path = getCarbonSutraEndpointPath(endpoint as CarbonSutraEndpointKey);
    const rawResponse = await callCarbonSutra({ path, payload });
    const co2eKg = extractCo2eKg(rawResponse);

    return NextResponse.json({
      ok: true,
      endpoint,
      payload,
      normalized: { co2eKg },
      fromCache: false,
      cacheKey: createCarbonCacheKey({ provider: 'CARBONSUTRA', endpoint, payload }),
      rawResponse,
    });
  } catch (error) {
    const upstreamDetails =
      error instanceof CarbonSutraRequestError
        ? {
            upstreamStatus: error.status,
            upstreamPath: error.path,
            upstreamResponse: error.response,
          }
        : {};

    return NextResponse.json(
      {
        ok: false,
        endpoint,
        payload,
        error: error instanceof Error ? error.message : 'CarbonSutra test request failed',
        ...upstreamDetails,
      },
      { status: 400 },
    );
  }
}
