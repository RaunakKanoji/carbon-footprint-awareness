'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

import {
  ApiAppFlowCard,
  ApiOverviewGrid,
  ApiPlaygroundShell,
  ApiPurposeCard,
  ApiStatusCard,
  DocsHintCard,
  type StatusRow,
} from './ApiPlaygroundConsole';
import ClimatiqBatchEstimateTester from './ClimatiqBatchEstimateTester';
import ClimatiqEstimateTester from './ClimatiqEstimateTester';
import ClimatiqFactorMappingPanel from './ClimatiqFactorMappingPanel';
import ClimatiqSearchPanel from './ClimatiqSearchPanel';

type ConfigResponse = {
  enabled: boolean;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
  dataVersionConfigured: boolean;
  missingVariables?: string[];
  endpoints: Array<{ endpoint: string; configured: boolean }>;
  error?: string;
};

type Tab = 'search' | 'estimate' | 'batch' | 'mappings' | 'config';

export default function ClimatiqPlayground() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [tab, setTab] = useState<Tab>('search');
  const [estimatePayloadText, setEstimatePayloadText] = useState<string | undefined>();
  const [mappingDraft, setMappingDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/dev/climatiq/config')
      .then((res) => res.json())
      .then(setConfig)
      .catch((error) =>
        setConfig({
          enabled: false,
          baseUrlConfigured: false,
          apiKeyConfigured: false,
          dataVersionConfigured: false,
          endpoints: [],
          error: error instanceof Error ? error.message : 'Failed to load configuration',
        }),
      );
  }, []);

  const canRun = Boolean(config?.baseUrlConfigured && config?.apiKeyConfigured && config?.dataVersionConfigured);
  const statusRows: StatusRow[] =
    config && !config.error
      ? [
          { label: 'API key', status: config.apiKeyConfigured ? 'configured' : 'missing' },
          { label: 'Base URL', status: config.baseUrlConfigured ? 'configured' : 'missing' },
          { label: 'Data version', status: config.dataVersionConfigured ? 'configured' : 'missing' },
          { label: 'Playground', status: config.enabled ? 'enabled' : 'disabled' },
          ...config.endpoints.map((item): StatusRow => ({
            label: `${item.endpoint} endpoint`,
            status: item.configured ? 'configured' : 'missing',
          })),
        ]
      : [];

  return (
    <ApiPlaygroundShell
      title="Climatiq Playground"
      description="Search emission factors, inspect metadata, save mappings, and test single or batch estimates."
      providerType="Emission factor and advanced estimate provider"
      status={canRun ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Carbon provider', 'Emission factors', 'Mappings']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Search first for activity IDs',
              'Inspect region, unit type, source, year, and quality flags',
              'Save selected factors as app mappings',
              'Run single and batch carbon estimates',
            ]}
            warning="Do not use placeholder activity IDs in production estimates."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'Search emission factors by activity, region, and unit type',
              'Inspect activity_id, factor id, source, year, and data quality',
              'Save a selected factor as an app mapping',
              'User-facing forms build estimate payloads from saved mappings',
              'ActivityLog stores normalized co2eKg from the Climatiq response',
            ]}
          />
        }
        config={
          <ApiStatusCard
            rows={statusRows}
            loading={!config}
            error={config?.error}
            missingHint={
              !canRun && config?.missingVariables?.length
                ? `Configure ${config.missingVariables.join(', ')} before running Climatiq tests.`
                : undefined
            }
          />
        }
      />

      <DocsHintCard>
        <p>Recommended flow: search factors, use a result in Estimate, save it as a mapping, then test the user-facing form path.</p>
      </DocsHintCard>

      <div className="flex flex-wrap gap-2">
        {[
          ['search', 'Search Factors'],
          ['estimate', 'Estimate'],
          ['batch', 'Batch Estimate'],
          ['mappings', 'Saved Mappings'],
          ['config', 'Config'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as Tab)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              tab === key
                ? 'border-accent-primary bg-accent-primary text-white'
                : 'border-border-default bg-bg-surface text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'search' ? (
        <ClimatiqSearchPanel
          canRun={canRun}
          onUseEstimate={(factor) => {
            setEstimatePayloadText(JSON.stringify({
              emission_factor: {
                activity_id: factor.activity_id,
                data_version: '^33',
                region: factor.region,
              },
              parameters: {
                weight: 100,
                weight_unit: 'kg',
              },
            }, null, 2));
            setTab('estimate');
          }}
          onSaveMapping={(factor) => {
            setMappingDraft({
              label: factor.name ?? factor.activity_id ?? '',
              appCategory: 'PRODUCT',
              appActivityType: 'product.steel.weight',
              climatiqActivityId: factor.activity_id ?? '',
              climatiqFactorId: factor.id ?? '',
              climatiqDataVersion: '^33',
              climatiqRegion: factor.region ?? '',
              unitType: factor.unit_type ?? '',
            });
            setTab('mappings');
          }}
        />
      ) : null}
      {tab === 'estimate' ? <ClimatiqEstimateTester canRun={canRun} payloadText={estimatePayloadText} onPayloadTextChange={setEstimatePayloadText} /> : null}
      {tab === 'batch' ? <ClimatiqBatchEstimateTester canRun={canRun} /> : null}
      {tab === 'mappings' ? <ClimatiqFactorMappingPanel canRun={canRun} draft={mappingDraft} onDraftChange={(draft) => setMappingDraft(draft as Record<string, string>)} /> : null}
      {tab === 'config' ? (
        <Card>
          <CardHeader>
            <CardTitle>Config</CardTitle>
            <CardDescription>Current non-secret configuration status.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg border border-border-default bg-bg-base p-3 text-xs text-text-primary">
              {JSON.stringify(config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </ApiPlaygroundShell>
  );
}
