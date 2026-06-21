'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import { formatCo2eKg } from '@/src/lib/format-carbon';

import JsonResponseViewer from './JsonResponseViewer';

const DEFAULT_PAYLOAD = {
  emission_factor: {
    activity_id: 'metals-type_steel_section',
    data_version: '^33',
  },
  parameters: {
    weight: 100,
    weight_unit: 'kg',
  },
};

export default function ClimatiqEstimateTester({
  canRun,
  payloadText,
  onPayloadTextChange,
}: {
  canRun: boolean;
  payloadText?: string;
  onPayloadTextChange?: (value: string) => void;
}) {
  const [localPayloadText, setLocalPayloadText] = useState(() => JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [useCache, setUseCache] = useState(true);
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPayloadText = payloadText ?? localPayloadText;
  const setPayloadText = onPayloadTextChange ?? setLocalPayloadText;

  const runEstimate = async () => {
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(currentPayloadText) as Record<string, unknown>;
      const res = await fetch('/api/dev/climatiq/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, useCache }),
      });
      setResponse(await res.json());
    } catch (error) {
      setResponse({ ok: false, error: error instanceof Error ? error.message : 'Invalid JSON payload' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseObject = typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : null;
  const normalized = responseObject?.normalized as { co2eKg?: number } | undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Estimate</CardTitle>
          <CardDescription>Test a raw Climatiq estimate payload.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input type="checkbox" checked={useCache} onChange={(event) => setUseCache(event.target.checked)} />
            Use cache
          </label>
          <Textarea value={currentPayloadText} onChange={(event) => setPayloadText(event.target.value)} className="min-h-[320px] font-mono text-xs" spellCheck={false} />
          <Button type="button" onClick={runEstimate} disabled={!canRun || isSubmitting}>
            {isSubmitting ? 'Running estimate...' : 'Run estimate'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>Normalized and raw Climatiq response.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {responseObject && 'ok' in responseObject ? (
            <div className="grid gap-2 rounded-lg border border-border-default bg-bg-base p-3 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={responseObject.ok ? 'text-accent-primary' : 'text-state-error'}>{responseObject.ok ? 'Success' : 'Failed'}</span>
              </div>
              {normalized?.co2eKg !== undefined ? (
                <div className="flex justify-between">
                  <span>Normalized result</span>
                  <span className="font-semibold">{formatCo2eKg(normalized.co2eKg)} kg CO₂e</span>
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
          <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
        </CardContent>
      </Card>
    </div>
  );
}
