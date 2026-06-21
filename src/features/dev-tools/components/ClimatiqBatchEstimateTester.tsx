'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';

import JsonResponseViewer from './JsonResponseViewer';

const DEFAULT_BATCH = [
  {
    emission_factor: {
      activity_id: 'metals-type_steel_section',
      data_version: '^33',
    },
    parameters: {
      weight: 100,
      weight_unit: 'kg',
    },
  },
  {
    emission_factor: {
      activity_id: 'metals-type_steel_section',
      data_version: '^33',
    },
    parameters: {
      weight: 50,
      weight_unit: 'kg',
    },
  },
];

export default function ClimatiqBatchEstimateTester({ canRun }: { canRun: boolean }) {
  const [payloadText, setPayloadText] = useState(() => JSON.stringify(DEFAULT_BATCH, null, 2));
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runBatch = async () => {
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>[];
      const res = await fetch('/api/dev/climatiq/batch-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      setResponse(await res.json());
    } catch (error) {
      setResponse({ ok: false, error: error instanceof Error ? error.message : 'Invalid JSON payload' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Batch estimate</CardTitle>
          <CardDescription>Test multiple Climatiq estimate payloads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} className="min-h-[360px] font-mono text-xs" spellCheck={false} />
          <Button type="button" onClick={runBatch} disabled={!canRun || isSubmitting}>
            {isSubmitting ? 'Running batch...' : 'Run batch estimate'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>Normalized array and raw Climatiq response.</CardDescription>
        </CardHeader>
        <CardContent>
          <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
        </CardContent>
      </Card>
    </div>
  );
}
