'use client';

import { useEffect, useState } from 'react';

import {
  ApiAppFlowCard,
  ApiErrorPanel,
  ApiOverviewGrid,
  ApiPlaygroundShell,
  ApiPurposeCard,
  ApiStatusCard,
  ApiTestHistoryPanel,
  DocsHintCard,
  EndpointExplanationCard,
  NormalizedOutputCard,
  RequestPreviewCard,
  type HistoryItem,
  type StatusRow,
} from '@/src/features/dev-tools/components/ApiPlaygroundConsole';
import JsonResponseViewer from '@/src/features/dev-tools/components/JsonResponseViewer';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Textarea } from '@/src/components/ui/textarea';

const searchSample = JSON.stringify({ query: 'rice', limit: 20 }, null, 2);
const estimateSample = JSON.stringify({ factorId: 'factor_id', quantityKg: 0.25 }, null, 2);
const mappingSample = JSON.stringify(
  {
    appCategory: 'FOOD',
    appActivityType: 'rice',
    openFoodFactsTag: 'en:rice',
    label: 'Rice category mapping',
    agribalyseFoodFactorId: 'factor_id',
    defaultQuantityKg: 0.25,
    confidence: 'MEDIUM',
    isActive: true,
  },
  null,
  2,
);
const matchSample = JSON.stringify({ barcode: '8901123001214', quantityKg: 0.023, createActivityLog: false }, null, 2);

async function postJson(path: string, body: string) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

async function getJson(path: string) {
  const res = await fetch(path);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed');
  return data;
}

export default function AgribalysePlayground() {
  const [config, setConfig] = useState<unknown>(null);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchBody, setSearchBody] = useState(searchSample);
  const [estimateBody, setEstimateBody] = useState(estimateSample);
  const [mappingBody, setMappingBody] = useState(mappingSample);
  const [matchBody, setMatchBody] = useState(matchSample);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('3.2');
  const [confirmBody, setConfirmBody] = useState('');
  const [activeEndpoint, setActiveEndpoint] = useState('Config');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    run('Config', () => getJson('/api/dev/agribalyse/config')).catch(() => undefined);
  }, []);

  async function run(endpoint: string, action: () => Promise<unknown>) {
    setError(null);
    try {
      const data = await action();
      setResponse(data);
      if (endpoint === 'Config') setConfig(data);
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'Agribalyse',
          endpoint,
          status: 'Success',
          result: (data as { estimate?: { co2eKg?: number }; co2eKg?: number }).estimate?.co2eKg !== undefined
            ? `${(data as { estimate: { co2eKg: number } }).estimate.co2eKg.toFixed(3)} kg CO2e`
            : (data as { co2eKg?: number }).co2eKg !== undefined
              ? `${(data as { co2eKg: number }).co2eKg.toFixed(3)} kg CO2e`
              : 'Dataset response',
          fromCache: false,
        },
        ...items,
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setHistory((items) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'Agribalyse', endpoint, status: 'Failed', result: message, fromCache: false },
        ...items,
      ]);
    }
  }

  const configRecord = typeof config === 'object' && config !== null ? (config as Record<string, unknown>) : null;
  const stats = (configRecord?.stats ?? configRecord) as Record<string, unknown> | null;
  const importedFactors = Number(stats?.factorCount ?? stats?.importedFactors ?? 0);

  return (
    <ApiPlaygroundShell
      title="Agribalyse Playground"
      description="Import and test the local Agribalyse food LCA dataset, factor search, estimates, category mappings, and Open Food Facts matching."
      providerType="Local food LCA dataset provider"
      status={importedFactors > 0 ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Dataset', 'No key required', 'Food carbon']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Synthese des resultats main estimates',
              'Lifecycle stage detail for explanations',
              'Ingredient detail for contribution analysis',
              'Food category mappings for Open Food Facts tags',
            ]}
            warning="Agribalyse estimates are category-based LCA estimates, not exact product-specific measurements."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'Developer imports the local Agribalyse CSV dataset',
              'Developer searches factors and saves food category mappings',
              'Open Food Facts product tags match active Agribalyse mappings',
              'App calculates quantityKg × kgCO2ePerKg',
              'ActivityLog is created only when explicitly requested',
            ]}
          />
        }
        config={
          <ApiStatusCard
            rows={[
              { label: 'API key', status: 'not-required' },
              { label: 'Dataset version', status: configRecord?.version || configRecord?.datasetVersion ? 'configured' : 'missing', detail: String(configRecord?.version ?? configRecord?.datasetVersion ?? 'None') },
              { label: 'Imported factors', status: importedFactors > 0 ? 'configured' : 'missing', detail: importedFactors.toLocaleString() },
              { label: 'Lifecycle rows', status: 'optional', detail: String(stats?.lifecycleRows ?? 0) },
              { label: 'Ingredient rows', status: 'optional', detail: String(stats?.ingredientRows ?? 0) },
              { label: 'Playground', status: 'enabled' },
            ] satisfies StatusRow[]}
            loading={!config}
            error={configRecord?.error ? String(configRecord.error) : undefined}
            missingHint={config && importedFactors === 0 ? 'No Agribalyse dataset imported. Import Synthese des resultats first to enable food estimates.' : undefined}
          />
        }
      />

      <DocsHintCard>
        <p>Synthese is the main estimate table. Lifecycle detail and ingredient detail explain breakdowns when those files are available.</p>
      </DocsHintCard>

      <EndpointExplanationCard
        title={activeEndpoint}
        what="Run local dataset import, factor search, estimate, mapping, and product-match tests."
        appUse="The product carbon flow uses active mappings from Open Food Facts tags to Agribalyse factor rows."
        required={['Imported dataset for search and estimates', 'Real factor id for estimates and mappings']}
        optional={['defaultQuantityKg', 'replaceExistingVersion', 'createActivityLog off by default']}
        normalized={['foodName', 'quantityKg', 'kgCO2ePerKg', 'co2eKg', 'provider', 'confidence']}
        errors={['No dataset imported', 'Unknown factor id', 'Invalid column mapping', 'No category mapping found']}
      />

      <Tabs defaultValue="config">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="config" onClick={() => setActiveEndpoint('Config')}>Config</TabsTrigger>
          <TabsTrigger value="import" onClick={() => setActiveEndpoint('Import Dataset')}>Import Dataset</TabsTrigger>
          <TabsTrigger value="search" onClick={() => setActiveEndpoint('Search Factors')}>Search Factors</TabsTrigger>
          <TabsTrigger value="estimate" onClick={() => setActiveEndpoint('Estimate')}>Estimate</TabsTrigger>
          <TabsTrigger value="mappings" onClick={() => setActiveEndpoint('Category Mappings')}>Category Mappings</TabsTrigger>
          <TabsTrigger value="match" onClick={() => setActiveEndpoint('Open Food Facts Match Test')}>Open Food Facts Match Test</TabsTrigger>
          <TabsTrigger value="stats" onClick={() => setActiveEndpoint('Stats')}>Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card><CardHeader><CardTitle>Agribalyse config</CardTitle></CardHeader><CardContent className="space-y-3"><Button onClick={() => run('Config', () => getJson('/api/dev/agribalyse/config'))}>Load config</Button><NormalizedOutputCard value={config ?? response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="import">
          <Card><CardHeader><CardTitle>Import dataset</CardTitle></CardHeader><CardContent className="space-y-3">
            <Input type="file" accept=".csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <Input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="Version" />
            <RequestPreviewCard internalRoute="/api/dev/agribalyse/import-preview" externalEndpoint="Local CSV import preview" method="POST" payload={{ file: file?.name ?? 'Choose CSV', version }} />
            <Button onClick={() => run('Import Preview', async () => {
              if (!file) throw new Error('Choose a CSV file first');
              const form = new FormData();
              form.set('file', file);
              form.set('version', version);
              const res = await fetch('/api/dev/agribalyse/import-preview', { method: 'POST', body: form });
              const data = await res.json();
              setConfirmBody(JSON.stringify({ jobId: data.jobId, version, columnMapping: data.detectedMapping, replaceExistingVersion: false }, null, 2));
              return data;
            })}>Preview import</Button>
            <Textarea value={confirmBody} onChange={(event) => setConfirmBody(event.target.value)} rows={8} placeholder="Confirm import payload appears here" />
            <RequestPreviewCard internalRoute="/api/dev/agribalyse/import-confirm" externalEndpoint="Local CSV import confirm" method="POST" payload={confirmBody} />
            <Button variant="outline" onClick={() => run('Import Confirm', () => postJson('/api/dev/agribalyse/import-confirm', confirmBody))}>Confirm import</Button>
            <NormalizedOutputCard value={response} />
            <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="search">
          <Card><CardHeader><CardTitle>Search factors</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={searchBody} onChange={(event) => setSearchBody(event.target.value)} rows={5} /><RequestPreviewCard internalRoute="/api/dev/agribalyse/search" externalEndpoint="Local Agribalyse factor table" payload={searchBody} /><Button onClick={() => run('Search Factors', () => postJson('/api/dev/agribalyse/search', searchBody))}>Search</Button><NormalizedOutputCard value={response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="estimate">
          <Card><CardHeader><CardTitle>Estimate</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={estimateBody} onChange={(event) => setEstimateBody(event.target.value)} rows={5} /><RequestPreviewCard internalRoute="/api/dev/agribalyse/estimate" externalEndpoint="Local Agribalyse factor estimate" payload={estimateBody} /><Button onClick={() => run('Estimate', () => postJson('/api/dev/agribalyse/estimate', estimateBody))}>Estimate</Button><NormalizedOutputCard value={response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="mappings">
          <Card><CardHeader><CardTitle>Category mappings</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-text-secondary">Search factors first and replace the sample factor_id with a real Agribalyse factor id.</p><Textarea value={mappingBody} onChange={(event) => setMappingBody(event.target.value)} rows={9} /><RequestPreviewCard internalRoute="/api/dev/agribalyse/mappings" externalEndpoint="FoodFactorMapping table" payload={mappingBody} /><Button onClick={() => run('Category Mappings', () => postJson('/api/dev/agribalyse/mappings', mappingBody))}>Create mapping</Button><Button variant="outline" onClick={() => run('Load Mappings', () => getJson('/api/dev/agribalyse/mappings'))}>Load mappings</Button><NormalizedOutputCard value={response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="match">
          <Card><CardHeader><CardTitle>Open Food Facts match test</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={matchBody} onChange={(event) => setMatchBody(event.target.value)} rows={6} /><RequestPreviewCard internalRoute="/api/products/estimate-carbon" externalEndpoint="Open Food Facts tag to Agribalyse mapping" payload={matchBody} /><Button onClick={() => run('Open Food Facts Match Test', () => postJson('/api/products/estimate-carbon', matchBody))}>Test barcode match</Button><NormalizedOutputCard value={response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card><CardHeader><CardTitle>Stats</CardTitle></CardHeader><CardContent className="space-y-3"><Button onClick={() => run('Stats', () => getJson('/api/food/agribalyse/stats'))}>Load stats</Button><NormalizedOutputCard value={response} /><JsonResponseViewer value={response} onClear={() => setResponse(null)} /></CardContent></Card>
        </TabsContent>
      </Tabs>
      <ApiErrorPanel
        provider="Agribalyse"
        endpoint={activeEndpoint}
        message={error ?? undefined}
        fixes={['Go to Import Dataset tab', 'Upload Synthese des resultats CSV', 'Confirm column mapping', 'Replace sample factor_id with a real imported factor id']}
      />
      <ApiTestHistoryPanel items={history} />
    </ApiPlaygroundShell>
  );
}
