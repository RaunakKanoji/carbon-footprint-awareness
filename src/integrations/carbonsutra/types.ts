export type CarbonSutraEndpointKey =
  | 'vehicleType'
  | 'vehicleModel'
  | 'electricity'
  | 'flight'
  | 'fuel'
  | 'hotel'
  | 'freight'
  | 'ecommerceShipment';

export type CarbonSutraVehicleTypePayload = {
  vehicle_type: string;
  distance_value: number;
  distance_unit: 'km' | 'mi';
  fuel_type?: 'Diesel' | 'Petrol' | 'Unknown';
  include_wtt?: 'Y' | 'N';
};

export type CarbonSutraVehicleModelPayload = {
  vehicle_make: string;
  vehicle_model: string;
  distance_value: number;
  distance_unit: 'km' | 'mi';
};

export type CarbonSutraElectricityPayload = {
  country_name: string;
  electricity_value: number;
  electricity_unit: 'kWh' | 'MWh';
};

export type CarbonSutraFlightPayload = {
  iata_airport_from: string;
  iata_airport_to: string;
  flight_class?: 'Economy' | 'Premium' | 'Business' | 'First' | 'Average';
  round_trip?: 'Y' | 'N';
  add_rf?: 'Y' | 'N';
  include_wtt?: 'Y' | 'N';
  number_of_passengers?: number;
};

export type CarbonSutraFuelPayload = {
  fuel_usage: 'commercial' | 'industrial' | 'transport' | 'residential';
  fuel_name: string;
  fuel_value: number;
};

export type CarbonSutraHotelPayload = {
  country_code: string;   // ISO 3166-1 alpha-2, e.g. 'IN', 'US'
  city_name?: string;
  hotel_rating?: number;  // integer 1–5 (budget=1, luxury=5)
  number_of_nights: number;
  number_of_rooms?: number;
};

export type CarbonSutraFreightPayload = {
  transport_mode: string;
  freight_weight: number;
  distance_value: number;
};

export type CarbonSutraEcommerceShipmentPayload = {
  origin_country_code: string;
  destination_country_code: string;
  origin_postal_code?: string;
  destination_postal_code?: string;
  package_weight: number;
  add_rf?: 'Y' | 'N';
  include_wtt?: 'Y' | 'N';
};

export type CarbonSutraPayload =
  | CarbonSutraVehicleTypePayload
  | CarbonSutraVehicleModelPayload
  | CarbonSutraElectricityPayload
  | CarbonSutraFlightPayload
  | CarbonSutraFuelPayload
  | CarbonSutraHotelPayload
  | CarbonSutraFreightPayload
  | CarbonSutraEcommerceShipmentPayload;

export type NormalizedCarbonEstimate = {
  co2eKg: number;
  provider: 'CARBONSUTRA';
  endpoint: CarbonSutraEndpointKey;
  payload: Record<string, unknown>;
  response: unknown;
  fromCache: boolean;
};
