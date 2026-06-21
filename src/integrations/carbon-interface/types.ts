export type CarbonInterfaceEstimateType =
  | 'vehicle'
  | 'electricity'
  | 'flight'
  | 'shipping'
  | 'fuel_combustion';

export type CarbonInterfaceEndpointKey = 'estimate' | 'vehicleMakes' | 'vehicleModels';

export type CarbonInterfaceVehiclePayload = {
  type: 'vehicle';
  distance_unit: 'mi' | 'km';
  distance_value: number;
  vehicle_model_id: string;
};

export type CarbonInterfaceElectricityPayload = {
  type: 'electricity';
  electricity_unit: 'mwh' | 'kwh';
  electricity_value: number;
  country: string;
  state?: string;
};

export type CarbonInterfaceFlightPayload = {
  type: 'flight';
  passengers: number;
  legs: Array<{
    departure_airport: string;
    destination_airport: string;
  }>;
  distance_unit?: 'mi' | 'km';
};

export type CarbonInterfaceShippingPayload = {
  type: 'shipping';
  weight_unit: 'g' | 'lb' | 'kg' | 'mt';
  weight_value: number;
  distance_unit: 'mi' | 'km';
  distance_value: number;
  transport_method: 'ship' | 'train' | 'truck' | 'plane';
};

export type CarbonInterfaceFuelCombustionPayload = {
  type: 'fuel_combustion';
  fuel_source_type: string;
  fuel_source_unit: string;
  fuel_source_value: number;
};

export type CarbonInterfaceEstimatePayload =
  | CarbonInterfaceVehiclePayload
  | CarbonInterfaceElectricityPayload
  | CarbonInterfaceFlightPayload
  | CarbonInterfaceShippingPayload
  | CarbonInterfaceFuelCombustionPayload;

export type CarbonInterfaceRawEstimateResponse = {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      carbon_g?: number | string;
      carbon_lb?: number | string;
      carbon_kg?: number | string;
      carbon_mt?: number | string;
      estimated_at?: string;
      [key: string]: unknown;
    };
  };
};

export type NormalizedCarbonInterfaceEstimate = {
  co2eKg: number;
  provider: 'CARBON_INTERFACE';
  endpoint: CarbonInterfaceEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};
