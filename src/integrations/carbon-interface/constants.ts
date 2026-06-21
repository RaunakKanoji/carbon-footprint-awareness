export const CARBON_INTERFACE_ENDPOINTS = {
  estimates: '/estimates',
  vehicleMakes: '/vehicle_makes',
  vehicleModels: (makeId: string) => `/vehicle_makes/${makeId}/vehicle_models`,
};

export const CARBON_INTERFACE_PROVIDER = 'CARBON_INTERFACE' as const;

export const VEHICLE_DISTANCE_UNITS = ['mi', 'km'] as const;
export const ELECTRICITY_UNITS = ['kwh', 'mwh'] as const;
export const SHIPPING_WEIGHT_UNITS = ['g', 'lb', 'kg', 'mt'] as const;
export const SHIPPING_DISTANCE_UNITS = ['mi', 'km'] as const;
export const SHIPPING_TRANSPORT_METHODS = ['ship', 'train', 'truck', 'plane'] as const;

export function isCarbonInterfacePlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}

export function getCarbonInterfaceEndpointStatus() {
  return [
    { endpoint: 'estimates', configured: true },
    { endpoint: 'vehicleMakes', configured: true },
    { endpoint: 'vehicleModels', configured: true },
  ];
}
