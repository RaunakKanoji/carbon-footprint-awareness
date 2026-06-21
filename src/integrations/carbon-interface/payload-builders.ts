import type {
  CarbonInterfaceElectricityPayload,
  CarbonInterfaceFlightPayload,
  CarbonInterfaceFuelCombustionPayload,
  CarbonInterfaceShippingPayload,
  CarbonInterfaceVehiclePayload,
} from './types';

export function buildCarbonInterfaceVehiclePayload(input: {
  vehicleModelId: string;
  distanceValue: number;
  distanceUnit: 'mi' | 'km';
}): CarbonInterfaceVehiclePayload {
  return {
    type: 'vehicle',
    distance_unit: input.distanceUnit,
    distance_value: input.distanceValue,
    vehicle_model_id: input.vehicleModelId,
  };
}

export function buildCarbonInterfaceElectricityPayload(input: {
  country: string;
  state?: string;
  electricityValue: number;
  electricityUnit: 'kwh' | 'mwh';
}): CarbonInterfaceElectricityPayload {
  return {
    type: 'electricity',
    electricity_unit: input.electricityUnit,
    electricity_value: input.electricityValue,
    country: input.country.toLowerCase(),
    ...(input.state ? { state: input.state.toLowerCase() } : {}),
  };
}

export function buildCarbonInterfaceFlightPayload(input: {
  passengers: number;
  legs: Array<{
    departureAirport: string;
    destinationAirport: string;
  }>;
  distanceUnit?: 'mi' | 'km';
}): CarbonInterfaceFlightPayload {
  return {
    type: 'flight',
    passengers: input.passengers,
    legs: input.legs.map((leg) => ({
      departure_airport: leg.departureAirport.toLowerCase(),
      destination_airport: leg.destinationAirport.toLowerCase(),
    })),
    ...(input.distanceUnit ? { distance_unit: input.distanceUnit } : {}),
  };
}

export function buildCarbonInterfaceShippingPayload(input: {
  weightValue: number;
  weightUnit: 'g' | 'lb' | 'kg' | 'mt';
  distanceValue: number;
  distanceUnit: 'mi' | 'km';
  transportMethod: 'ship' | 'train' | 'truck' | 'plane';
}): CarbonInterfaceShippingPayload {
  return {
    type: 'shipping',
    weight_unit: input.weightUnit,
    weight_value: input.weightValue,
    distance_unit: input.distanceUnit,
    distance_value: input.distanceValue,
    transport_method: input.transportMethod,
  };
}

export function buildCarbonInterfaceFuelPayload(input: {
  fuelSourceType: string;
  fuelSourceUnit: string;
  fuelSourceValue: number;
}): CarbonInterfaceFuelCombustionPayload {
  return {
    type: 'fuel_combustion',
    fuel_source_type: input.fuelSourceType,
    fuel_source_unit: input.fuelSourceUnit,
    fuel_source_value: input.fuelSourceValue,
  };
}
