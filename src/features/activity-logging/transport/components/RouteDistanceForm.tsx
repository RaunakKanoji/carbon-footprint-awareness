'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import GoogleMapsLinkImport from './GoogleMapsLinkImport';
import RouteComparisonCard, { type RouteComparisonResult } from './RouteComparisonCard';
import RouteResultCard, { type RouteResult } from './RouteResultCard';
import SavedPlaceSelector, { type SavedPlace } from './SavedPlaceSelector';

type ImportedRoute = {
  id: string;
};

type RouteDistanceResponse = {
  ok: boolean;
  route?: RouteResult;
  importedRoute?: ImportedRoute | null;
  error?: string;
};

type RouteCarbonResponse = {
  ok: boolean;
  estimate?: { co2eKg: number };
  error?: string;
};

const PROFILE_OPTIONS = [
  ['driving-car', 'Car'],
  ['cycling-regular', 'Cycling'],
  ['foot-walking', 'Walking'],
  ['driving-hgv', 'Heavy vehicle'],
] as const;

function profileToTransportMode(profile: string) {
  if (profile.startsWith('cycling')) return 'cycling';
  if (profile.startsWith('foot')) return 'walking';
  if (profile === 'driving-hgv') return 'taxi';
  return 'car';
}

export default function RouteDistanceForm() {
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [profile, setProfile] = useState('driving-car');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeId, setRouteId] = useState<string | undefined>();
  const [comparison, setComparison] = useState<RouteComparisonResult[]>([]);
  const [carbonKg, setCarbonKg] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const selectOrigin = (place: SavedPlace) => {
    setOrigin({ lat: place.latitude, lng: place.longitude });
    setOriginText(place.address ?? place.label);
  };

  const selectDestination = (place: SavedPlace) => {
    setDestination({ lat: place.latitude, lng: place.longitude });
    setDestinationText(place.address ?? place.label);
  };

  const calculateRoute = async () => {
    setIsCalculating(true);
    setStatus('');
    setCarbonKg(undefined);

    try {
      const res = await fetch('/api/location/route-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin ?? undefined,
          destination: destination ?? undefined,
          originText,
          destinationText,
          profile,
          preference: 'recommended',
          includeGeometry: false,
          saveRoute: true,
        }),
      });
      const data = (await res.json()) as RouteDistanceResponse;
      if (!data.ok || !data.route) {
        throw new Error(data.error ?? 'Route calculation failed');
      }
      setRoute(data.route);
      setRouteId(data.importedRoute?.id);

      const compareRes = await fetch('/api/location/compare-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin ?? undefined,
          destination: destination ?? undefined,
          originText,
          destinationText,
          profiles: ['driving-car', 'cycling-regular', 'foot-walking'],
        }),
      });
      const compareData = (await compareRes.json()) as {
        ok: boolean;
        comparison?: RouteComparisonResult[];
      };
      setComparison(compareData.comparison ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Route calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const logCarbon = async () => {
    if (!route) return;
    setIsLogging(true);
    setStatus('');

    try {
      const res = await fetch('/api/carbon/estimate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId,
          distanceKm: route.distanceKm,
          transportMode: profileToTransportMode(profile),
          fuelType: 'Unknown',
        }),
      });
      const data = (await res.json()) as RouteCarbonResponse;
      if (!data.ok || !data.estimate) {
        throw new Error(data.error ?? 'Route carbon estimate failed');
      }
      setCarbonKg(data.estimate.co2eKg);
      setStatus('Route carbon activity logged.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Route carbon estimate failed');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div className="space-y-6">
        <GoogleMapsLinkImport
          onUseDirections={(originLabel, destinationLabel) => {
            setOrigin(null);
            setDestination(null);
            setOriginText(originLabel);
            setDestinationText(destinationLabel);
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Plan commute</CardTitle>
            <CardDescription>Calculate distance with OpenRouteService and save the route for carbon logging.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <SavedPlaceSelector label="Origin saved place" onSelect={selectOrigin} />
              <SavedPlaceSelector label="Destination saved place" onSelect={selectDestination} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-text-primary">
                Origin
                <Input
                  value={originText}
                  onChange={(event) => {
                    setOrigin(null);
                    setOriginText(event.target.value);
                  }}
                  placeholder="Home, office, station..."
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-text-primary">
                Destination
                <Input
                  value={destinationText}
                  onChange={(event) => {
                    setDestination(null);
                    setDestinationText(event.target.value);
                  }}
                  placeholder="Destination address"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid gap-1 text-sm font-medium text-text-primary">
                Travel mode
                <select
                  value={profile}
                  onChange={(event) => setProfile(event.target.value)}
                  className="h-10 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium text-text-primary"
                >
                  {PROFILE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                className="self-end"
                onClick={calculateRoute}
                disabled={isCalculating || !originText.trim() || !destinationText.trim()}
              >
                {isCalculating ? 'Calculating...' : 'Calculate route'}
              </Button>
            </div>

            {status ? <p className="text-sm font-medium text-text-secondary">{status}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <RouteResultCard route={route} carbonKg={carbonKg} isLogging={isLogging} onLogCarbon={route ? logCarbon : undefined} />
        <RouteComparisonCard comparison={comparison} />
      </div>
    </div>
  );
}
