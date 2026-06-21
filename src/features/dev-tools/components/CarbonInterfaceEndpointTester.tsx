'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { formatCo2eKg } from '@/src/lib/format-carbon';
import type { CarbonInterfaceEstimateType } from '@/src/integrations/carbon-interface/types';

import {
  ApiErrorPanel,
  ApiTestHistoryPanel,
  EndpointExplanationCard,
  NormalizedOutputCard,
  RequestPreviewCard,
  type HistoryItem,
} from './ApiPlaygroundConsole';
import JsonResponseViewer from './JsonResponseViewer';

type PlaygroundTab = CarbonInterfaceEstimateType | 'vehicleMakes' | 'vehicleModels';

const TAB_LABELS: Record<PlaygroundTab, string> = {
  vehicle: 'Vehicle',
  electricity: 'Electricity',
  flight: 'Flight',
  shipping: 'Shipping',
  fuel_combustion: 'Fuel Combustion',
  vehicleMakes: 'Vehicle Makes',
  vehicleModels: 'Vehicle Models',
};

const SAMPLE_PAYLOADS: Record<CarbonInterfaceEstimateType, Record<string, unknown>> = {
  vehicle: {
    type: 'vehicle',
    distance_unit: 'km',
    distance_value: 12,
    vehicle_model_id: '7268a9b7-17e8-4c8d-acca-57059252afe9',
  },
  electricity: {
    type: 'electricity',
    electricity_unit: 'kwh',
    electricity_value: 180,
    country: 'us',
    state: 'ny',
  },
  flight: {
    type: 'flight',
    passengers: 1,
    legs: [
      {
        departure_airport: 'bom',
        destination_airport: 'del',
      },
    ],
    distance_unit: 'km',
  },
  shipping: {
    type: 'shipping',
    weight_unit: 'kg',
    weight_value: 1.5,
    distance_unit: 'km',
    distance_value: 1200,
    transport_method: 'truck',
  },
  fuel_combustion: {
    type: 'fuel_combustion',
    fuel_source_type: 'dfo',
    fuel_source_unit: 'btu',
    fuel_source_value: 50000,
  },
};

function isEstimateType(tab: PlaygroundTab): tab is CarbonInterfaceEstimateType {
  return !['vehicleMakes', 'vehicleModels'].includes(tab);
}

export default function CarbonInterfaceEndpointTester({
  canRun,
  missingVariables,
}: {
  canRun: boolean;
  missingVariables: string[];
}) {
  const [tab, setTab] = useState<PlaygroundTab>('vehicle');
  const [useCache, setUseCache] = useState(true);
  const [payloadText, setPayloadText] = useState(() =>
    JSON.stringify(SAMPLE_PAYLOADS.vehicle, null, 2),
  );
  const [makeId, setMakeId] = useState('');
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const changeTab = (nextTab: PlaygroundTab) => {
    setTab(nextTab);
    setResponse(null);
    if (isEstimateType(nextTab)) {
      setPayloadText(JSON.stringify(SAMPLE_PAYLOADS[nextTab], null, 2));
    }
  };

  const runTest = async () => {
    setIsSubmitting(true);

    try {
      if (tab === 'vehicleMakes') {
        const res = await fetch('/api/dev/carbon-interface/vehicle-makes');
        const data = await res.json();
        setResponse(data);
        setHistory((items) => [
          { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'Carbon Interface', endpoint: 'Vehicle Makes', status: (data as { ok?: boolean }).ok === false ? 'Failed' : 'Success', result: 'Vehicle metadata', fromCache: false },
          ...items,
        ]);
        return;
      }

      if (tab === 'vehicleModels') {
        const res = await fetch(
          `/api/dev/carbon-interface/vehicle-models?makeId=${encodeURIComponent(makeId)}`,
        );
        const data = await res.json();
        setResponse(data);
        setHistory((items) => [
          { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'Carbon Interface', endpoint: 'Vehicle Models', status: (data as { ok?: boolean }).ok === false ? 'Failed' : 'Success', result: 'Vehicle metadata', fromCache: false },
          ...items,
        ]);
        return;
      }

      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const res = await fetch('/api/dev/carbon-interface/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tab, payload, useCache }),
      });
      const data = await res.json();
      setResponse(data);
      const normalizedResult = (data as { normalized?: { co2eKg?: number }; fromCache?: boolean; ok?: boolean }).normalized;
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'Carbon Interface',
          endpoint: TAB_LABELS[tab],
          status: (data as { ok?: boolean }).ok ? 'Success' : 'Failed',
          result: normalizedResult?.co2eKg !== undefined ? `${formatCo2eKg(normalizedResult.co2eKg)} kg CO2e` : undefined,
          fromCache: Boolean((data as { fromCache?: boolean }).fromCache),
        },
        ...items,
      ]);
    } catch (error) {
      const data = {
        ok: false,
        type: tab,
        error: error instanceof Error ? error.message : 'Invalid request',
      };
      setResponse(data);
      setHistory((items) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'Carbon Interface', endpoint: TAB_LABELS[tab], status: 'Failed', result: data.error, fromCache: false },
        ...items,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseObject =
    typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : null;
  const normalized = responseObject?.normalized as { co2eKg?: number } | undefined;

  return (
    <div className="grid gap-4">
      <EndpointExplanationCard
        title={TAB_LABELS[tab]}
        what="Run a Carbon Interface estimate or metadata lookup through secure server routes."
        appUse="Carbon Compass can use these normalized responses as fallback estimates for supported activity types and regions."
        required={tab === 'vehicleModels' ? ['Vehicle make ID'] : isEstimateType(tab) ? ['Valid estimate payload', 'API key', 'Base URL'] : ['API key', 'Base URL']}
        optional={isEstimateType(tab) ? ['useCache', 'Provider-specific optional fields'] : ['None']}
        normalized={isEstimateType(tab) ? ['co2eKg', 'provider', 'source endpoint', 'fromCache'] : ['Vehicle make/model metadata']}
        errors={['Missing API key', 'Invalid model ID', 'Unsupported region or unit', 'Provider validation error']}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint test</CardTitle>
          <CardDescription>Run Carbon Interface requests through secure server routes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Estimate type
            </label>
            <select
              value={tab}
              onChange={(event) => changeTab(event.target.value as PlaygroundTab)}
              className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium text-text-primary"
            >
              {Object.entries(TAB_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {isEstimateType(tab) ? (
            <>
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
            </>
          ) : null}

          {tab === 'vehicleModels' ? (
            <label className="grid gap-1 text-sm font-medium">
              Vehicle make ID
              <Input
                value={makeId}
                onChange={(event) => setMakeId(event.target.value)}
                placeholder="Paste a vehicle make ID"
              />
            </label>
          ) : null}

          {!canRun ? (
            <p className="rounded-lg border border-state-error/30 bg-bg-base p-3 text-sm font-medium text-state-error">
              Configure {missingVariables.join(', ')} before running Carbon Interface tests.
            </p>
          ) : null}

          <Button
            type="button"
            onClick={runTest}
            disabled={!canRun || isSubmitting || (tab === 'vehicleModels' && !makeId.trim())}
          >
            {isSubmitting ? 'Running test...' : 'Run test'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <RequestPreviewCard
          internalRoute={tab === 'vehicleMakes' ? '/api/dev/carbon-interface/vehicle-makes' : tab === 'vehicleModels' ? '/api/dev/carbon-interface/vehicle-models' : '/api/dev/carbon-interface/test'}
          externalEndpoint={`Carbon Interface ${TAB_LABELS[tab]}`}
          method={tab === 'vehicleModels' || tab === 'vehicleMakes' ? 'GET' : 'POST'}
          payload={isEstimateType(tab) ? { type: tab, payload: payloadText, useCache } : tab === 'vehicleModels' ? { makeId } : undefined}
          auth="Authorization: Bearer ••••••••"
        />
        <NormalizedOutputCard value={responseObject?.normalized ?? (responseObject && !('rawResponse' in responseObject) ? responseObject : null)} />
        <Card>
          <CardHeader>
            <CardTitle>Result details</CardTitle>
            <CardDescription>Status, cache state, and raw Carbon Interface response.</CardDescription>
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
              {normalized?.co2eKg !== undefined ? (
                <div className="flex justify-between">
                  <span>Normalized result</span>
                  <span className="font-semibold">
                    {formatCo2eKg(normalized.co2eKg)} kg CO₂e
                  </span>
                </div>
              ) : null}
              {'fromCache' in responseObject ? (
                <div className="flex justify-between">
                  <span>From cache</span>
                  <span>{responseObject.fromCache ? 'Yes' : 'No'}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          <ApiErrorPanel
            provider="Carbon Interface"
            endpoint={TAB_LABELS[tab]}
            message={responseObject?.ok === false ? String(responseObject.error ?? 'Request failed') : undefined}
            fixes={['Use Vehicle Makes and Vehicle Models before vehicle estimates', 'Check required payload fields', 'Verify region support', 'Confirm the API key is valid']}
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
