import 'server-only';

import type { NormalizedCarbonEstimate } from '@/src/integrations/carbonsutra/types';
import type { NormalizedClimatiqEstimate } from '@/src/integrations/climatiq/types';
import { saveCarbonActivity } from '@/src/server/carbon/activity.service';
import { estimateVehicleByType } from '@/src/server/carbon/carbon.service';
import { estimateTransportWithClimatiq } from '@/src/server/carbon/climatiq.service';
import { markRouteAsLogged } from '@/src/server/location/imported-route.service';

export type EstimateCarbonForRouteInput = {
  userId: string;
  routeId?: string;
  distanceKm: number;
  transportMode: 'car' | 'bike' | 'bus' | 'train' | 'taxi' | 'walking' | 'cycling';
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Unknown';
  provider?: 'CARBONSUTRA' | 'CARBON_INTERFACE' | 'CLIMATIQ';
};

type ManualRouteEstimate = {
  co2eKg: number;
  provider: 'MANUAL';
  endpoint: string;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};

export async function estimateCarbonForRoute(input: EstimateCarbonForRouteInput) {
  const mode = input.transportMode.toLowerCase();
  let co2eKg = 0;
  let provider = input.provider;
  let estimateResult: NormalizedCarbonEstimate | NormalizedClimatiqEstimate | ManualRouteEstimate | null = null;

  if (mode === 'walking' || mode === 'cycling' || mode === 'bike') {
    // Zero direct emissions
    co2eKg = 0;
    estimateResult = {
      co2eKg: 0,
      provider: 'MANUAL' as const,
      endpoint: 'manual',
      payload: { transportMode: input.transportMode },
      response: { message: 'Zero direct emissions for active transport' },
      fromCache: false,
    };
  } else if (mode === 'car' || mode === 'taxi') {
    // Use CarbonSutra by default, unless Climatiq is explicitly requested
    if (provider === 'CLIMATIQ') {
      estimateResult = await estimateTransportWithClimatiq({
        mappingKey: 'transport.car.average',
        distanceValue: input.distanceKm,
        distanceUnit: 'km',
      });
      co2eKg = estimateResult.co2eKg;
    } else {
      // CarbonSutra
      estimateResult = await estimateVehicleByType({
        vehicleType: 'Car-Size-Average',
        distanceValue: input.distanceKm,
        distanceUnit: 'km',
        fuelType: input.fuelType === 'Electric' ? 'Unknown' : input.fuelType, // CarbonSutra supports Petrol, Diesel, Unknown
        includeWtt: false,
      });
      co2eKg = estimateResult.co2eKg;
      provider = 'CARBONSUTRA';
    }
  } else if (mode === 'bus' || mode === 'train') {
    if (provider === 'CARBONSUTRA') {
      try {
        estimateResult = await estimateVehicleByType({
          vehicleType: mode === 'bus' ? 'Bus-Size-Average' : 'Train-Size-Average',
          distanceValue: input.distanceKm,
          distanceUnit: 'km',
          fuelType: 'Unknown',
          includeWtt: false,
        });
        co2eKg = estimateResult.co2eKg;
      } catch (err) {
        console.warn('CarbonSutra transit estimate failed, falling back to Climatiq', err);
        // Fallback to Climatiq
        const mappingKey = mode === 'bus' ? 'transport.bus.local' : 'transport.train.local';
        estimateResult = await estimateTransportWithClimatiq({
          mappingKey,
          distanceValue: input.distanceKm,
          distanceUnit: 'km',
        });
        co2eKg = estimateResult.co2eKg;
        provider = 'CLIMATIQ';
      }
    } else {
      // Use Climatiq by default for transit
      const mappingKey = mode === 'bus' ? 'transport.bus.local' : 'transport.train.local';
      estimateResult = await estimateTransportWithClimatiq({
        mappingKey,
        distanceValue: input.distanceKm,
        distanceUnit: 'km',
      });
      co2eKg = estimateResult.co2eKg;
      provider = 'CLIMATIQ';
    }
  } else {
    // Fallback to Climatiq car average
    estimateResult = await estimateTransportWithClimatiq({
      mappingKey: 'transport.car.average',
      distanceValue: input.distanceKm,
      distanceUnit: 'km',
    });
    co2eKg = estimateResult.co2eKg;
    provider = 'CLIMATIQ';
  }

  // Create ActivityLog entry
  const note = `Route travel: ${input.distanceKm.toFixed(1)} km via ${input.transportMode}${
    input.fuelType && input.fuelType !== 'Unknown' ? ` (${input.fuelType})` : ''
  }`;

  const activity = await saveCarbonActivity({
    userId: input.userId,
    category: 'TRANSPORT',
    activityType: input.transportMode,
    distanceValue: input.distanceKm,
    distanceUnit: 'km',
    note,
    estimate: estimateResult,
  });

  // Link route if routeId exists
  if (input.routeId) {
    await markRouteAsLogged(input.userId, input.routeId, activity.id);
  }

  return {
    activity,
    estimate: {
      co2eKg,
      provider: estimateResult.provider,
      fromCache: estimateResult.fromCache,
    },
  };
}
