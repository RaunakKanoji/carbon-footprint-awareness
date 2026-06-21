'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import type { CarbonSutraEndpointKey } from '@/src/integrations/carbonsutra/types';
import { formatCo2eKg } from '@/src/lib/format-carbon';

import {
  ApiErrorPanel,
  ApiTestHistoryPanel,
  EndpointExplanationCard,
  NormalizedOutputCard,
  RequestPreviewCard,
  type HistoryItem,
} from './ApiPlaygroundConsole';
import JsonResponseViewer from './JsonResponseViewer';

const ENDPOINT_LABELS: Record<CarbonSutraEndpointKey, string> = {
  vehicleType: 'Vehicle by Type',
  vehicleModel: 'Vehicle by Model',
  electricity: 'Electricity',
  flight: 'Flight',
  fuel: 'Fuel',
  hotel: 'Hotel Stay',
  freight: 'Freight / Shipping',
  ecommerceShipment: 'eCommerce Shipment',
};

const SAMPLE_PAYLOADS: Record<CarbonSutraEndpointKey, Record<string, unknown>> = {
  vehicleType: {
    vehicle_type: 'Car-Size-Average',
    distance_value: 12,
    distance_unit: 'km',
    fuel_type: 'Petrol',
    include_wtt: 'Y',
  },
  vehicleModel: {
    vehicle_make: 'Toyota',
    vehicle_model: 'Corolla',
    distance_value: 12,
    distance_unit: 'km',
  },
  electricity: {
    country_name: 'India',
    electricity_value: 180,
    electricity_unit: 'kWh',
  },
  flight: {
    iata_airport_from: 'BOM',
    iata_airport_to: 'DEL',
    flight_class: 'Economy',
    round_trip: 'Y',
    add_rf: 'Y',
    include_wtt: 'Y',
    number_of_passengers: 1,
  },
  fuel: {
    fuel_usage: 'transport',
    fuel_name: 'Regular Petrol',
    fuel_value: 20,
  },
  hotel: {
    country_code: 'IN',
    city_name: 'Mumbai',
    hotel_rating: 3,
    number_of_nights: 2,
    number_of_rooms: 1,
  },
  freight: {
    transport_mode: 'Road',
    freight_weight: 1000,
    distance_value: 120,
  },
  ecommerceShipment: {
    origin_country_code: 'IN',
    destination_country_code: 'IN',
    origin_postal_code: '400001',
    destination_postal_code: '110001',
    package_weight: 1.5,
    add_rf: 'N',
    include_wtt: 'Y',
  },
};

type EndpointStatus = {
  endpoint: string;
  configured: boolean;
};

export default function CarbonSutraEndpointTester({
  endpoints,
}: {
  endpoints: EndpointStatus[];
}) {
  const [endpoint, setEndpoint] = useState<CarbonSutraEndpointKey>('vehicleType');
  const [useCache, setUseCache] = useState(true);
  const [payloadText, setPayloadText] = useState(() =>
    JSON.stringify(SAMPLE_PAYLOADS.vehicleType, null, 2),
  );
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const currentStatus = useMemo(
    () => endpoints.find((item) => item.endpoint === endpoint),
    [endpoint, endpoints],
  );

  const changeEndpoint = (nextEndpoint: CarbonSutraEndpointKey) => {
    setEndpoint(nextEndpoint);
    setPayloadText(JSON.stringify(SAMPLE_PAYLOADS[nextEndpoint], null, 2));
    setResponse(null);
  };

  const runTest = async () => {
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const res = await fetch('/api/dev/carbonsutra/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, payload, useCache }),
      });
      const data = await res.json();
      setResponse(data);
      const normalized = (data as { normalized?: { co2eKg?: number }; fromCache?: boolean; ok?: boolean }).normalized;
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'CarbonSutra',
          endpoint: ENDPOINT_LABELS[endpoint],
          status: (data as { ok?: boolean }).ok ? 'Success' : 'Failed',
          result: normalized?.co2eKg !== undefined ? `${formatCo2eKg(normalized.co2eKg)} kg CO2e` : undefined,
          fromCache: Boolean((data as { fromCache?: boolean }).fromCache),
        },
        ...items,
      ]);
    } catch (error) {
      const data = {
        ok: false,
        endpoint,
        error: error instanceof Error ? error.message : 'Invalid JSON payload',
      };
      setResponse(data);
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'CarbonSutra',
          endpoint: ENDPOINT_LABELS[endpoint],
          status: 'Failed',
          result: data.error,
          fromCache: false,
        },
        ...items,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseObject =
    typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : null;
  const normalized = responseObject?.normalized ?? null;

  return (
    <div className="grid gap-4">
      <EndpointExplanationCard
        title={ENDPOINT_LABELS[endpoint]}
        what="Run a lifestyle emissions estimate through the secure CarbonSutra dev route."
        appUse="The user-facing carbon form uses equivalent normalized values when logging lifestyle activities."
        required={['Endpoint-specific payload fields', 'Configured endpoint path', 'Valid RapidAPI credentials']}
        optional={['useCache', 'WTT/RF/round trip flags where supported']}
        normalized={['co2eKg', 'provider', 'source endpoint', 'activity category', 'fromCache']}
        errors={['Missing endpoint path', 'Invalid payload fields', 'RapidAPI subscription or key failure']}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint test</CardTitle>
          <CardDescription>Run CarbonSutra requests through the secure server route.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Endpoint
            </label>
            <select
              value={endpoint}
              onChange={(event) => changeEndpoint(event.target.value as CarbonSutraEndpointKey)}
              className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium text-text-primary"
            >
              {Object.entries(ENDPOINT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm">
            <span>Status</span>
            <span
              className={
                currentStatus?.configured
                  ? 'font-semibold text-accent-primary'
                  : 'font-semibold text-state-error'
              }
            >
              {currentStatus?.configured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input
              type="checkbox"
              checked={useCache}
              onChange={(event) => setUseCache(event.target.checked)}
            />
            Use cache
          </label>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Payload editor
            </label>
            <Textarea
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
              className="min-h-[280px] font-mono text-xs"
              spellCheck={false}
            />
          </div>

          <Button type="button" onClick={runTest} disabled={isSubmitting || !currentStatus?.configured}>
            {isSubmitting ? 'Running test...' : 'Run test'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <RequestPreviewCard
          internalRoute="/api/dev/carbonsutra/test"
          externalEndpoint={`CarbonSutra ${endpoint}`}
          payload={{ endpoint, payload: payloadText, useCache }}
          auth="RapidAPI key: ••••••••"
        />
        <NormalizedOutputCard value={normalized} />
        <Card>
          <CardHeader>
            <CardTitle>Result details</CardTitle>
            <CardDescription>Status, cache state, and raw CarbonSutra response.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
          {typeof response === 'object' && response !== null && 'ok' in response ? (
            <div className="grid gap-2 rounded-lg border border-border-default bg-bg-base p-3 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={(response as { ok?: boolean }).ok ? 'text-accent-primary' : 'text-state-error'}>
                  {(response as { ok?: boolean }).ok ? 'Success' : 'Failed'}
                </span>
              </div>
              {'normalized' in response ? (
                <div className="flex justify-between">
                  <span>Normalized result</span>
                  <span className="font-semibold">
                    {formatCo2eKg(
                      (response as { normalized?: { co2eKg?: number } }).normalized?.co2eKg ?? 0,
                    )}{' '}
                    kg CO₂e
                  </span>
                </div>
              ) : null}
              {'fromCache' in response ? (
                <div className="flex justify-between">
                  <span>From cache</span>
                  <span>{(response as { fromCache?: boolean }).fromCache ? 'Yes' : 'No'}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          <ApiErrorPanel
            provider="CarbonSutra"
            endpoint={ENDPOINT_LABELS[endpoint]}
            message={responseObject?.ok === false ? String(responseObject.error ?? 'Request failed') : undefined}
            fixes={['Check endpoint path in .env.local', 'Check required payload fields', 'Verify RapidAPI subscription', 'Confirm the API key is valid']}
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
