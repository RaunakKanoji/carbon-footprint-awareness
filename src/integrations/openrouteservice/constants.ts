export const OPENROUTESERVICE_PROVIDER = 'OPENROUTESERVICE' as const;

export const ORS_ENDPOINTS = {
  geocode: '/geocode/search',
  reverseGeocode: '/geocode/reverse',
  directions: (profile: string) => `/v2/directions/${profile}`,
  matrix: (profile: string) => `/v2/matrix/${profile}`,
};

export const ORS_PROFILES = [
  'driving-car',
  'driving-hgv',
  'cycling-regular',
  'cycling-road',
  'cycling-mountain',
  'cycling-electric',
  'foot-walking',
  'foot-hiking',
  'wheelchair',
] as const;

export type OpenRouteServiceProfile = typeof ORS_PROFILES[number];

export const DEFAULT_ORS_PROFILE: OpenRouteServiceProfile = 'driving-car';

export function isOpenRouteServicePlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}

export function getOpenRouteServiceEndpointStatus() {
  return [
    { endpoint: 'geocode', configured: Boolean(process.env.OPENROUTESERVICE_API_KEY) },
    { endpoint: 'reverseGeocode', configured: Boolean(process.env.OPENROUTESERVICE_API_KEY) },
    { endpoint: 'directions', configured: Boolean(process.env.OPENROUTESERVICE_API_KEY) },
    { endpoint: 'matrix', configured: Boolean(process.env.OPENROUTESERVICE_API_KEY) },
  ];
}
