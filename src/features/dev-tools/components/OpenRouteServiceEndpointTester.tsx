'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';

import {
  ApiErrorPanel,
  ApiTestHistoryPanel,
  EndpointExplanationCard,
  NormalizedOutputCard,
  RequestPreviewCard,
  type HistoryItem,
} from './ApiPlaygroundConsole';
import JsonResponseViewer from './JsonResponseViewer';

type TestType = 'geocode' | 'reverseGeocode' | 'directions' | 'matrix' | 'compare' | 'importGoogleMapsLink';

const LABELS: Record<TestType, string> = {
  geocode: 'Geocode',
  reverseGeocode: 'Reverse Geocode',
  directions: 'Directions',
  matrix: 'Matrix',
  compare: 'Compare Routes',
  importGoogleMapsLink: 'Import Google Maps Link',
};

const SAMPLES: Record<TestType, Record<string, unknown>> = {
  geocode: {
    type: 'geocode',
    text: 'Empire State Building, New York',
    boundaryCountry: 'US',
    size: 3,
  },
  reverseGeocode: {
    type: 'reverseGeocode',
    lat: 40.7484,
    lng: -73.9857,
  },
  directions: {
    type: 'directions',
    origin: { lat: 40.7484, lng: -73.9857 },
    destination: { lat: 40.7527, lng: -73.9772 },
    profile: 'driving-car',
    preference: 'recommended',
    includeGeometry: false,
    useCache: true,
  },
  matrix: {
    type: 'matrix',
    locations: [
      { lat: 40.7484, lng: -73.9857 },
      { lat: 40.7527, lng: -73.9772 },
    ],
    profile: 'driving-car',
    metrics: ['distance', 'duration'],
  },
  compare: {
    type: 'compare',
    origin: { lat: 40.7484, lng: -73.9857 },
    destination: { lat: 40.7527, lng: -73.9772 },
    profiles: ['driving-car', 'cycling-regular', 'foot-walking'],
  },
  importGoogleMapsLink: {
    type: 'importGoogleMapsLink',
    url: 'https://www.google.com/maps/dir/Empire+State+Building/Grand+Central+Terminal',
  },
};

export default function OpenRouteServiceEndpointTester({
  canRun,
  missingVariables,
}: {
  canRun: boolean;
  missingVariables: string[];
}) {
  const [type, setType] = useState<TestType>('geocode');
  const [payloadText, setPayloadText] = useState(() => JSON.stringify(SAMPLES.geocode, null, 2));
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const changeType = (nextType: TestType) => {
    setType(nextType);
    setPayloadText(JSON.stringify(SAMPLES[nextType], null, 2));
    setResponse(null);
  };

  const runTest = async () => {
    setIsSubmitting(true);

    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const res = await fetch('/api/dev/openrouteservice/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponse(data);
      const responseRoute = (data as { route?: { distanceKm?: number; durationMinutes?: number; fromCache?: boolean }; ok?: boolean; fromCache?: boolean }).route;
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'OpenRouteService',
          endpoint: LABELS[type],
          status: (data as { ok?: boolean }).ok === false ? 'Failed' : 'Success',
          result: responseRoute?.distanceKm !== undefined ? `${responseRoute.distanceKm.toFixed(2)} km` : 'Route metadata',
          fromCache: Boolean(responseRoute?.fromCache || (data as { fromCache?: boolean }).fromCache),
        },
        ...items,
      ]);
    } catch (error) {
      const data = {
        ok: false,
        type,
        error: error instanceof Error ? error.message : 'Invalid request',
      };
      setResponse(data);
      setHistory((items) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'OpenRouteService', endpoint: LABELS[type], status: 'Failed', result: data.error, fromCache: false },
        ...items,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseObject =
    typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : null;
  const route = responseObject?.route as { distanceKm?: number; durationMinutes?: number; fromCache?: boolean } | undefined;

  return (
    <div className="grid gap-4">
      <EndpointExplanationCard
        title={LABELS[type]}
        what="Run a routing, geocoding, matrix, comparison, or Google Maps import test."
        appUse="The commuting flow uses route distance before sending distance to a carbon provider."
        required={['Endpoint type', 'Coordinates, address text, or Google Maps URL', 'OpenRouteService API key']}
        optional={['Profile', 'preference', 'geometry, metrics, and cache flags']}
        normalized={['distanceKm', 'durationMinutes', 'profile', 'fromCache']}
        errors={['Missing API key', 'Invalid coordinate order', 'Unsupported route profile', 'Unparseable Google Maps URL']}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint test</CardTitle>
          <CardDescription>Run OpenRouteService requests through secure server routes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Endpoint
            </label>
            <select
              value={type}
              onChange={(event) => changeType(event.target.value as TestType)}
              className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium text-text-primary"
            >
              {Object.entries(LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Payload editor
            </label>
            <Textarea
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
              className="min-h-[340px] font-mono text-xs"
              spellCheck={false}
            />
          </div>

          {!canRun ? (
            <p className="rounded-lg border border-state-error/30 bg-bg-base p-3 text-sm font-medium text-state-error">
              Configure {missingVariables.join(', ')} before running OpenRouteService tests.
            </p>
          ) : null}

          <Button type="button" onClick={runTest} disabled={!canRun || isSubmitting}>
            {isSubmitting ? 'Running test...' : 'Run test'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <RequestPreviewCard
          internalRoute="/api/dev/openrouteservice/test"
          externalEndpoint={`OpenRouteService ${LABELS[type]}`}
          payload={payloadText}
          auth="Authorization header: ••••••••"
        />
        <NormalizedOutputCard value={route ?? responseObject?.normalized ?? null} />
        <Card>
          <CardHeader>
            <CardTitle>Result details</CardTitle>
            <CardDescription>Status, cache state, and raw upstream response where available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
          {responseObject && 'ok' in responseObject ? (
            <div className="grid gap-2 rounded-lg border border-border-default bg-bg-base p-3 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={responseObject.ok ? 'text-accent-primary' : 'text-state-error'}>
                  {responseObject.ok ? 'Success' : 'Failed'}
                </span>
              </div>
              {route?.distanceKm !== undefined ? (
                <div className="flex justify-between">
                  <span>Route</span>
                  <span className="font-semibold">
                    {route.distanceKm.toFixed(2)} km / {(route.durationMinutes ?? 0).toFixed(0)} min
                  </span>
                </div>
              ) : null}
              {route?.fromCache !== undefined || 'fromCache' in responseObject ? (
                <div className="flex justify-between">
                  <span>From cache</span>
                  <span>{route?.fromCache || responseObject.fromCache ? 'Yes' : 'No'}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          <ApiErrorPanel
            provider="OpenRouteService"
            endpoint={LABELS[type]}
            message={responseObject?.ok === false ? String(responseObject.error ?? 'Request failed') : undefined}
            fixes={['Check coordinate format: app uses { lat, lng }, provider payloads use [lng, lat]', 'Check API key and base URL', 'Check route profile', 'Use a full Google Maps directions URL']}
            raw={responseObject?.ok === false ? responseObject : undefined}
          />
          <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
          </CardContent>
        </Card>
      </div>
      </div>
      <ApiTestHistoryPanel items={history} />
    </div>
  );
}
