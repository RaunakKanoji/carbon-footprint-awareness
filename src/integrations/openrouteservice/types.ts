import type { OpenRouteServiceProfile } from './constants';

export type Coordinate = {
  lat: number;
  lng: number;
};

export type OrsCoordinateTuple = [number, number]; // [lng, lat]

export type GeocodeInput = {
  text: string;
  boundaryCountry?: string;
  size?: number;
};

export type ReverseGeocodeInput = {
  lat: number;
  lng: number;
};

export type RouteDistanceInput = {
  origin: Coordinate;
  destination: Coordinate;
  profile: OpenRouteServiceProfile;
  preference?: 'fastest' | 'shortest' | 'recommended';
  includeGeometry?: boolean;
};

export type RouteMatrixInput = {
  locations: Coordinate[];
  sources?: number[];
  destinations?: number[];
  profile: OpenRouteServiceProfile;
  metrics?: Array<'distance' | 'duration'>;
};

export type NormalizedRouteResult = {
  provider: 'OPENROUTESERVICE';
  profile: OpenRouteServiceProfile;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  geometry?: unknown;
  bbox?: unknown;
  rawResponse: unknown;
  fromCache: boolean;
};

export type NormalizedGeocodeResult = {
  label: string;
  name?: string;
  address?: string;
  lat: number;
  lng: number;
  confidence?: number;
  raw: unknown;
};
