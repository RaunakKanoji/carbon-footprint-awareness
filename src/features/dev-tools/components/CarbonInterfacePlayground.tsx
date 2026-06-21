'use client';

import { useEffect, useState } from 'react';

import {
  ApiAppFlowCard,
  ApiOverviewGrid,
  ApiPlaygroundShell,
  ApiPurposeCard,
  ApiStatusCard,
  DocsHintCard,
  type StatusRow,
} from './ApiPlaygroundConsole';
import CarbonInterfaceEndpointTester from './CarbonInterfaceEndpointTester';

type ConfigResponse = {
  enabled: boolean;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
  missingVariables?: string[];
  endpoints: Array<{ endpoint: string; configured: boolean }>;
  error?: string;
};

export default function CarbonInterfacePlayground() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);

  useEffect(() => {
    fetch('/api/dev/carbon-interface/config')
      .then((res) => res.json())
      .then(setConfig)
      .catch((error) =>
        setConfig({
          enabled: false,
          baseUrlConfigured: false,
          apiKeyConfigured: false,
          endpoints: [],
          error: error instanceof Error ? error.message : 'Failed to load configuration',
        }),
      );
  }, []);

  const canRun = Boolean(config?.baseUrlConfigured && config?.apiKeyConfigured);
  const statusRows: StatusRow[] =
    config && !config.error
      ? [
          { label: 'API key', status: config.apiKeyConfigured ? 'configured' : 'missing' },
          { label: 'Base URL', status: config.baseUrlConfigured ? 'configured' : 'missing' },
          { label: 'Playground', status: config.enabled ? 'enabled' : 'disabled' },
          ...config.endpoints.map(
            (item): StatusRow => ({
              label: `${item.endpoint} endpoint`,
              status: item.configured ? 'configured' : 'missing',
            }),
          ),
        ]
      : [];

  return (
    <ApiPlaygroundShell
      title="Carbon Interface Playground"
      description="Test clean fallback estimates for vehicles, electricity, flights, shipping, fuel combustion, and vehicle metadata."
      providerType="Carbon calculation fallback/provider"
      status={config?.enabled && config.apiKeyConfigured ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Carbon provider', 'Live API', 'Estimate']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Vehicle makes and models lookup',
              'Vehicle estimates with vehicle_model_id',
              'Supported-region electricity estimates',
              'Shipping, flights, and fuel combustion',
            ]}
            warning="Vehicle estimates require a vehicle_model_id. Use Vehicle Makes and Vehicle Models before testing vehicle estimates."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'Developer looks up make and model IDs when needed',
              'Secure dev route calls Carbon Interface with a redacted bearer token',
              'App normalizes co2eKg, provider, source endpoint, and cache state',
              'Carbon Compass can use this as a simple fallback for supported regions',
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
                ? `Configure ${config.missingVariables.join(', ')} before running Carbon Interface tests.`
                : undefined
            }
          />
        }
      />

      <DocsHintCard>
        <p>Carbon Interface electricity is strongest for supported country/state regions. Use CarbonSutra or Climatiq for India-focused electricity if needed.</p>
      </DocsHintCard>

      <CarbonInterfaceEndpointTester
        canRun={canRun}
        missingVariables={config?.missingVariables ?? []}
      />
    </ApiPlaygroundShell>
  );
}
