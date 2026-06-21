import { describe, expect, it } from 'vitest';

import { createCarbonInterfaceCacheKey } from './cache';
import { extractCo2eKgFromCarbonInterface, parsePossibleNumber } from './normalize';
import {
  buildCarbonInterfaceElectricityPayload,
  buildCarbonInterfaceFlightPayload,
  buildCarbonInterfaceVehiclePayload,
} from './payload-builders';

describe('Carbon Interface helpers', () => {
  it('parses finite number values and numeric strings', () => {
    expect(parsePossibleNumber(12.3)).toBe(12.3);
    expect(parsePossibleNumber('4.56')).toBe(4.56);
    expect(parsePossibleNumber('abc')).toBeNull();
    expect(parsePossibleNumber(Number.NaN)).toBeNull();
  });

  it('extracts carbon_kg from standard Carbon Interface responses', () => {
    expect(
      extractCo2eKgFromCarbonInterface({
        data: {
          attributes: {
            carbon_kg: '3.42',
          },
        },
      }),
    ).toBe(3.42);
  });

  it('builds normalized app-friendly estimate payloads', () => {
    expect(
      buildCarbonInterfaceVehiclePayload({
        vehicleModelId: 'model-id',
        distanceValue: 12,
        distanceUnit: 'km',
      }),
    ).toEqual({
      type: 'vehicle',
      distance_unit: 'km',
      distance_value: 12,
      vehicle_model_id: 'model-id',
    });

    expect(
      buildCarbonInterfaceElectricityPayload({
        country: 'US',
        state: 'NY',
        electricityValue: 180,
        electricityUnit: 'kwh',
      }),
    ).toEqual({
      type: 'electricity',
      electricity_unit: 'kwh',
      electricity_value: 180,
      country: 'us',
      state: 'ny',
    });

    expect(
      buildCarbonInterfaceFlightPayload({
        passengers: 1,
        legs: [{ departureAirport: 'BOM', destinationAirport: 'DEL' }],
        distanceUnit: 'km',
      }),
    ).toEqual({
      type: 'flight',
      passengers: 1,
      legs: [{ departure_airport: 'bom', destination_airport: 'del' }],
      distance_unit: 'km',
    });
  });

  it('creates stable cache keys for equivalent input', () => {
    const input = {
      provider: 'CARBON_INTERFACE',
      endpoint: 'estimate',
      payload: { type: 'electricity', country: 'us' },
    };

    expect(createCarbonInterfaceCacheKey(input)).toBe(createCarbonInterfaceCacheKey(input));
  });
});
