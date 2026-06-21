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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Textarea } from '@/src/components/ui/textarea';

const productSample = JSON.stringify({ barcode: '3017624010701', useCache: true }, null, 2);
const searchSample = JSON.stringify({ query: 'oat milk', page: 1, pageSize: 10 }, null, 2);
const estimateSample = JSON.stringify(
  { barcode: '3017624010701', quantityKg: 0.4, createActivityLog: false },
  null,
  2,
);
const mappingSample = JSON.stringify(
  {
    provider: 'MANUAL',
    appCategory: 'FOOD',
    openFoodFactsTag: 'en:chocolate-spreads',
    label: 'Chocolate spread',
    manualCo2ePerKg: 3.1,
    defaultWeightKg: 0.4,
    confidence: 'MEDIUM',
    isActive: true,
  },
  null,
  2,
);

async function postJson(path: string, body: string) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

function getNormalizedProduct(value: unknown) {
  const record = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  const product = (record?.product ?? record) as Record<string, unknown> | null;
  if (!product || typeof product !== 'object') return null;
  return {
    barcode: product.barcode,
    productName: product.productName,
    brand: product.brand,
    quantity: product.quantity,
    categoryTags: product.categoryTags,
    ecoScore: product.ecoScore,
    nutriScore: product.nutriScore,
    novaGroup: product.novaGroup,
    carbonEstimateStatus: record?.status,
  };
}

export default function OpenFoodFactsPlayground() {
  const [config, setConfig] = useState<unknown>(null);
  const [productBody, setProductBody] = useState(productSample);
  const [searchBody, setSearchBody] = useState(searchSample);
  const [estimateBody, setEstimateBody] = useState(estimateSample);
  const [mappingBody, setMappingBody] = useState(mappingSample);
  const [response, setResponse] = useState<unknown>(null);
  const [mappings, setMappings] = useState<unknown[]>([]);
  const [recentScans, setRecentScans] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState('Config');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadConfig().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load config'));
  }, []);

  async function run(endpoint: string, action: () => Promise<unknown>) {
    setError(null);
    try {
      const data = await action();
      setResponse(data);
      const normalized = getNormalizedProduct(data);
      setHistory((items) => [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'Open Food Facts',
          endpoint,
          status: 'Success',
          result: normalized?.productName ? String(normalized.productName) : 'Metadata response',
          fromCache: Boolean((data as { fromCache?: boolean }).fromCache),
        },
        ...items,
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setHistory((items) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), provider: 'Open Food Facts', endpoint, status: 'Failed', result: message, fromCache: false },
        ...items,
      ]);
    }
  }

  async function loadConfig() {
    const res = await fetch('/api/dev/open-food-facts/config');
    const data = await res.json();
    setConfig(data);
  }

  async function loadMappings() {
    const res = await fetch('/api/dev/open-food-facts/category-mappings');
    const data = await res.json();
    setMappings(data.mappings ?? []);
    setResponse(data);
  }

  return (
    <ApiPlaygroundShell
      title="Open Food Facts Playground"
      description="Test barcode lookup, deliberate product search, category tags, product metadata, carbon mapping checks, and recent scans."
      providerType="Barcode and product metadata provider"
      status={(config as { userAgentConfigured?: boolean } | null)?.userAgentConfigured ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Metadata only', 'No key required', 'Product data']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Barcode lookup',
              'Product name, brand, quantity, and images',
              'Category tags, ingredients, packaging, labels',
              'Eco-Score, Nutri-Score, and NOVA metadata',
            ]}
            warning="Open Food Facts identifies products. Carbon estimates come from Agribalyse, Climatiq, or manual factors. Eco-Score is not kg CO2e."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'User scans or enters a barcode',
              'Open Food Facts identifies product metadata and category tags',
              'App maps product/category tags to Agribalyse, Climatiq, or manual factors',
              'Carbon estimate is calculated only after mapping',
              'ProductScan and optional ActivityLog are saved after explicit user action',
            ]}
          />
        }
        config={
          <ApiStatusCard
            rows={[
              { label: 'API key', status: 'not-required' },
              { label: 'Base URL', status: (config as { baseUrlConfigured?: boolean } | null)?.baseUrlConfigured ? 'configured' : 'missing' },
              { label: 'User-Agent', status: (config as { userAgentConfigured?: boolean } | null)?.userAgentConfigured ? 'configured' : 'missing' },
              { label: 'Product lookup endpoint', status: 'available' },
              { label: 'Search endpoint', status: 'available' },
              { label: 'Playground', status: (config as { enabled?: boolean } | null)?.enabled ? 'enabled' : 'disabled' },
            ] satisfies StatusRow[]}
            loading={!config}
            error={(config as { error?: string } | null)?.error}
            missingHint={
              config && !(config as { userAgentConfigured?: boolean }).userAgentConfigured
                ? 'Missing User-Agent. Configure OPEN_FOOD_FACTS_USER_AGENT and restart the dev server.'
                : undefined
            }
          />
        }
      />

      <DocsHintCard>
        <p>Do not use Open Food Facts search as search-as-you-type. Use deliberate search only.</p>
      </DocsHintCard>

      <EndpointExplanationCard
        title={activeEndpoint}
        what="Run product metadata and food carbon mapping tests through Carbon Compass server routes."
        appUse="The product scanner uses this metadata to find category tags and then tries Agribalyse, Climatiq, or manual factor mappings."
        required={['Barcode, query, mapping payload, or estimate payload depending on tab']}
        optional={['useCache', 'page', 'pageSize', 'createActivityLog off by default']}
        normalized={['barcode', 'productName', 'brand', 'categoryTags', 'ecoScore', 'carbonEstimateStatus']}
        errors={['Missing User-Agent', 'Product not found', 'No category mapping', 'Invalid mapping payload']}
      />

      <Tabs defaultValue="config">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="config" onClick={() => setActiveEndpoint('Config')}>Config</TabsTrigger>
          <TabsTrigger value="barcode" onClick={() => setActiveEndpoint('Barcode Lookup')}>Barcode Lookup</TabsTrigger>
          <TabsTrigger value="search" onClick={() => setActiveEndpoint('Product Search')}>Product Search</TabsTrigger>
          <TabsTrigger value="mapping" onClick={() => setActiveEndpoint('Category Tags and Mappings')}>Category Tags</TabsTrigger>
          <TabsTrigger value="estimate" onClick={() => setActiveEndpoint('Carbon Mapping Test')}>Carbon Mapping Test</TabsTrigger>
          <TabsTrigger value="recent" onClick={() => setActiveEndpoint('Recent Scans')}>Recent Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Config status</CardTitle>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" onClick={loadConfig}>Refresh config</Button>
              <NormalizedOutputCard value={config} />
              <JsonResponseViewer value={config} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barcode">
          <Card>
            <CardHeader>
              <CardTitle>Barcode product lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={productBody} onChange={(event) => setProductBody(event.target.value)} rows={6} />
              <RequestPreviewCard internalRoute="/api/dev/open-food-facts/product" externalEndpoint="Open Food Facts product lookup" payload={productBody} auth="User-Agent only; no API key" />
              <Button type="button" onClick={() => run('Barcode Lookup', () => postJson('/api/dev/open-food-facts/product', productBody))}>
                Run lookup
              </Button>
              <NormalizedOutputCard value={getNormalizedProduct(response)} />
              <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Product search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={searchBody} onChange={(event) => setSearchBody(event.target.value)} rows={6} />
              <RequestPreviewCard internalRoute="/api/dev/open-food-facts/search" externalEndpoint="Open Food Facts search" payload={searchBody} auth="User-Agent only; no API key" />
              <Button type="button" onClick={() => run('Product Search', () => postJson('/api/dev/open-food-facts/search', searchBody))}>
                Run search
              </Button>
              <NormalizedOutputCard value={response} />
              <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Category mappings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={mappingBody} onChange={(event) => setMappingBody(event.target.value)} rows={11} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => run('Category Mapping', () => postJson('/api/dev/open-food-facts/category-mappings', mappingBody))}>
                  Create mapping
                </Button>
                <Button type="button" variant="outline" onClick={loadMappings}>
                  Load mappings
                </Button>
              </div>
              <div className="overflow-auto rounded-lg border border-border-default">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-bg-base text-text-secondary">
                    <tr>
                      <th className="p-2">Open Food Facts tag</th>
                      <th className="p-2">App category</th>
                      <th className="p-2">Provider</th>
                      <th className="p-2">Factor label</th>
                      <th className="p-2">Manual kg CO2e/kg</th>
                      <th className="p-2">Default weight</th>
                      <th className="p-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping) => {
                      const row = mapping as Record<string, unknown>;
                      return (
                        <tr key={String(row.id)} className="border-t border-border-default">
                          <td className="p-2">{String(row.openFoodFactsTag ?? '')}</td>
                          <td className="p-2">{String(row.appCategory ?? '')}</td>
                          <td className="p-2">{String(row.provider ?? '')}</td>
                          <td className="p-2">{String(row.label ?? '')}</td>
                          <td className="p-2">{String(row.manualCo2ePerKg ?? '')}</td>
                          <td className="p-2">{String(row.defaultWeightKg ?? '')}</td>
                          <td className="p-2">{String(row.isActive ?? '')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <NormalizedOutputCard value={response} />
              <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimate">
          <Card>
            <CardHeader>
              <CardTitle>Carbon estimate test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={estimateBody} onChange={(event) => setEstimateBody(event.target.value)} rows={7} />
              <RequestPreviewCard internalRoute="/api/products/estimate-carbon" externalEndpoint="Open Food Facts + Agribalyse/Climatiq/manual mapping" payload={estimateBody} />
              <Button type="button" onClick={() => run('Carbon Mapping Test', () => postJson('/api/products/estimate-carbon', estimateBody))}>
                Estimate product
              </Button>
              <NormalizedOutputCard value={response} />
              <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent scans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                onClick={() =>
                  run('Recent Scans', async () => {
                    const res = await fetch('/api/products/recent');
                    const data = await res.json();
                    setRecentScans(data);
                    return data;
                  })
                }
              >
                Load recent scans
              </Button>
              <NormalizedOutputCard value={recentScans ?? response} />
              <JsonResponseViewer value={recentScans ?? response} onClear={() => setRecentScans(null)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ApiErrorPanel
        provider="Open Food Facts"
        endpoint={activeEndpoint}
        message={error ?? undefined}
        fixes={['Configure OPEN_FOOD_FACTS_USER_AGENT', 'Try manual search or check the barcode', 'Create an active food carbon mapping', 'Keep createActivityLog false unless intentionally saving an activity']}
      />
      <ApiTestHistoryPanel items={history} />
    </ApiPlaygroundShell>
  );
}
