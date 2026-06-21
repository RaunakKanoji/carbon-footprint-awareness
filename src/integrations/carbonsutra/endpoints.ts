import type { CarbonSutraEndpointKey } from './types';

export const CARBONSUTRA_ENDPOINT_KEYS: CarbonSutraEndpointKey[] = [
  'vehicleType',
  'vehicleModel',
  'electricity',
  'flight',
  'fuel',
  'hotel',
  'freight',
  'ecommerceShipment',
];

export const CARBONSUTRA_ENDPOINTS: Record<CarbonSutraEndpointKey, string | undefined> = {
  vehicleType: process.env.CARBONSUTRA_VEHICLE_TYPE_PATH,
  vehicleModel: process.env.CARBONSUTRA_VEHICLE_MODEL_PATH,
  electricity: process.env.CARBONSUTRA_ELECTRICITY_PATH,
  flight: process.env.CARBONSUTRA_FLIGHT_PATH,
  fuel: process.env.CARBONSUTRA_FUEL_PATH,
  hotel: process.env.CARBONSUTRA_HOTEL_PATH,
  freight: process.env.CARBONSUTRA_FREIGHT_PATH,
  ecommerceShipment: process.env.CARBONSUTRA_ECOMMERCE_SHIPMENT_PATH,
};

export function getCarbonSutraEndpointPath(endpoint: CarbonSutraEndpointKey) {
  const path = CARBONSUTRA_ENDPOINTS[endpoint];

  if (!path) {
    throw new Error(`CarbonSutra endpoint path is not configured for: ${endpoint}`);
  }

  return path;
}

export function getCarbonSutraEndpointStatus() {
  return CARBONSUTRA_ENDPOINT_KEYS.map((key) => ({
    endpoint: key,
    configured: Boolean(CARBONSUTRA_ENDPOINTS[key]),
  }));
}

export function isDevApiPlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}
