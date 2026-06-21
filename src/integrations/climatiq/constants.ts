export const CLIMATIQ_ENDPOINTS = {
  search: '/data/v1/search',
  estimate: '/data/v1/estimate',
  batchEstimate: '/data/v1/estimate/batch',
};

export const CLIMATIQ_PROVIDER = 'CLIMATIQ' as const;

export const DEFAULT_CLIMATIQ_DATA_VERSION = process.env.CLIMATIQ_DATA_VERSION || '^33';

export const CLIMATIQ_DISTANCE_UNITS = ['m', 'km', 'mi'] as const;
export const CLIMATIQ_WEIGHT_UNITS = ['g', 'kg', 't', 'lb'] as const;
export const CLIMATIQ_ENERGY_UNITS = ['Wh', 'kWh', 'MWh', 'MJ', 'GJ'] as const;
export const CLIMATIQ_MONEY_UNITS = ['usd', 'eur', 'gbp', 'inr'] as const;

export function isClimatiqPlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}

export function getClimatiqEndpointStatus() {
  return [
    { endpoint: 'search', configured: true },
    { endpoint: 'estimate', configured: true },
    { endpoint: 'batchEstimate', configured: true },
  ];
}
