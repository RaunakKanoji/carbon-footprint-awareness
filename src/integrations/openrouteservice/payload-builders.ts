import type {
  Coordinate,
  RouteDistanceInput,
  RouteMatrixInput,
  OrsCoordinateTuple,
} from './types';

export function toOrsCoordinate(coordinate: Coordinate): OrsCoordinateTuple {
  return [coordinate.lng, coordinate.lat];
}

export function buildDirectionsPayload(input: RouteDistanceInput) {
  return {
    coordinates: [
      toOrsCoordinate(input.origin),
      toOrsCoordinate(input.destination),
    ],
    preference: input.preference ?? 'recommended',
    instructions: false,
    geometry: input.includeGeometry ?? false,
  };
}

export function buildMatrixPayload(input: RouteMatrixInput) {
  return {
    locations: input.locations.map(toOrsCoordinate),
    sources: input.sources,
    destinations: input.destinations,
    metrics: input.metrics ?? ['distance', 'duration'],
    units: 'km',
  };
}
