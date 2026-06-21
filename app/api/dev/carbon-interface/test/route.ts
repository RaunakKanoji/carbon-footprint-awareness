import { z } from 'zod';

import { NextResponse } from 'next/server';

import { CarbonInterfaceRequestError } from '@/src/integrations/carbon-interface/client';
import { isCarbonInterfacePlaygroundEnabled } from '@/src/integrations/carbon-interface/constants';
import { extractCo2eKgFromCarbonInterface } from '@/src/integrations/carbon-interface/normalize';
import {
  buildCarbonInterfaceElectricityPayload,
  buildCarbonInterfaceFlightPayload,
  buildCarbonInterfaceFuelPayload,
  buildCarbonInterfaceShippingPayload,
  buildCarbonInterfaceVehiclePayload,
} from '@/src/integrations/carbon-interface/payload-builders';
import { estimateWithCarbonInterface } from '@/src/server/carbon/carbon-interface.service';
import { getCurrentUser } from '@/src/lib/auth';

const rawPayloadSchema = z.record(z.string(), z.unknown());

const testSchema = z.object({
  type: z.enum(['vehicle', 'electricity', 'flight', 'shipping', 'fuel_combustion']),
  payload: rawPayloadSchema,
  useCache: z.boolean().optional().default(true),
});

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function normalizePayload(type: z.infer<typeof testSchema>['type'], payload: Record<string, unknown>) {
  if (type === 'vehicle') {
    return buildCarbonInterfaceVehiclePayload({
      vehicleModelId: String(payload.vehicle_model_id ?? ''),
      distanceValue: Number(payload.distance_value),
      distanceUnit: payload.distance_unit === 'mi' ? 'mi' : 'km',
    });
  }

  if (type === 'electricity') {
    return buildCarbonInterfaceElectricityPayload({
      country: String(payload.country ?? ''),
      state: payload.state ? String(payload.state) : undefined,
      electricityValue: Number(payload.electricity_value),
      electricityUnit: payload.electricity_unit === 'mwh' ? 'mwh' : 'kwh',
    });
  }

  if (type === 'flight') {
    const legs = Array.isArray(payload.legs) ? payload.legs : [];
    return buildCarbonInterfaceFlightPayload({
      passengers: Number(payload.passengers),
      legs: legs.map((leg) => {
        const value = leg as Record<string, unknown>;
        return {
          departureAirport: String(value.departure_airport ?? ''),
          destinationAirport: String(value.destination_airport ?? ''),
        };
      }),
      distanceUnit: payload.distance_unit === 'mi' || payload.distance_unit === 'km' ? payload.distance_unit : undefined,
    });
  }

  if (type === 'shipping') {
    return buildCarbonInterfaceShippingPayload({
      weightValue: Number(payload.weight_value),
      weightUnit:
        payload.weight_unit === 'g' ||
        payload.weight_unit === 'lb' ||
        payload.weight_unit === 'mt'
          ? payload.weight_unit
          : 'kg',
      distanceValue: Number(payload.distance_value),
      distanceUnit: payload.distance_unit === 'mi' ? 'mi' : 'km',
      transportMethod:
        payload.transport_method === 'ship' ||
        payload.transport_method === 'train' ||
        payload.transport_method === 'plane'
          ? payload.transport_method
          : 'truck',
    });
  }

  return buildCarbonInterfaceFuelPayload({
    fuelSourceType: String(payload.fuel_source_type ?? ''),
    fuelSourceUnit: String(payload.fuel_source_unit ?? ''),
    fuelSourceValue: Number(payload.fuel_source_value),
  });
}

export async function POST(req: Request) {
  const enabled = isCarbonInterfacePlaygroundEnabled();

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
        error: 'Invalid Carbon Interface test payload',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { type, payload, useCache } = parsed.data;

  try {
    const normalizedPayload = normalizePayload(type, payload);
    const estimate = await estimateWithCarbonInterface({
      payload: normalizedPayload,
      useCache,
    });

    return NextResponse.json({
      ok: true,
      type,
      payload: normalizedPayload,
      normalized: { co2eKg: estimate.co2eKg },
      fromCache: estimate.fromCache,
      rawResponse: estimate.response,
    });
  } catch (error) {
    const rawResponse =
      error instanceof CarbonInterfaceRequestError ? error.response : undefined;
    let normalized: { co2eKg: number } | undefined;

    if (rawResponse !== undefined) {
      try {
        normalized = { co2eKg: extractCo2eKgFromCarbonInterface(rawResponse) };
      } catch {
        normalized = undefined;
      }
    }

    return NextResponse.json(
      {
        ok: false,
        type,
        payload,
        normalized,
        error: error instanceof Error ? error.message : 'Carbon Interface test request failed',
        ...(error instanceof CarbonInterfaceRequestError
          ? {
              upstreamStatus: error.status,
              upstreamPath: error.path,
              upstreamResponse: error.response,
            }
          : {}),
      },
      { status: 400 },
    );
  }
}
