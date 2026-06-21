'use client';

import { useEffect, useState } from 'react';

import {
  ApiAppFlowCard,
  ApiOverviewGrid,
  ApiPlaygroundShell,
  ApiPurposeCard,
  ApiStatusCard,
  type StatusRow,
} from './ApiPlaygroundConsole';
import CarbonSutraEndpointTester from './CarbonSutraEndpointTester';

type ConfigResponse = {
  enabled: boolean;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
  hostConfigured: boolean;
  endpoints: Array<{ endpoint: string; configured: boolean }>;
  error?: string;
};

export default function CarbonSutraPlayground() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);

  useEffect(() => {
    fetch('/api/dev/carbonsutra/config')
      .then((res) => res.json())
      .then(setConfig)
      .catch((error) =>
        setConfig({
          enabled: false,
          baseUrlConfigured: false,
          apiKeyConfigured: false,
          hostConfigured: false,
          endpoints: [],
          error: error instanceof Error ? error.message : 'Failed to load configuration',
        }),
      );
  }, []);

  const statusRows: StatusRow[] =
    config && !config.error
      ? [
          { label: 'API key', status: config.apiKeyConfigured ? 'configured' : 'missing' },
          { label: 'RapidAPI host', status: config.hostConfigured ? 'configured' : 'missing' },
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
      title="CarbonSutra Playground"
      description="Test lifestyle carbon APIs for commute, electricity, flights, fuel, hotels, freight, and eCommerce shipments."
      providerType="Carbon calculation provider"
      status={config?.enabled ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Carbon provider', 'Live API', 'Estimate']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Commute and vehicle emissions',
              'India-friendly electricity',
              'Flights with RF, WTT, and round trip options',
              'Fuel use, hotels, freight, and eCommerce shipments',
            ]}
            warning="Use this for most MVP lifestyle calculations. Playground tests do not create ActivityLog entries unless an endpoint explicitly asks for it."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'Developer chooses a lifestyle endpoint and sample payload',
              'Secure dev route calls CarbonSutra without exposing RapidAPI secrets',
              'App normalizes co2eKg, provider, endpoint, category, and cache status',
              'User-facing carbon flows can store the same normalized result in ActivityLog',
            ]}
          />
        }
        config={
          <ApiStatusCard
            rows={statusRows}
            loading={!config}
            error={config?.error}
            missingHint={
              config && statusRows.some((row) => row.status === 'missing')
                ? 'Missing API key or endpoint path. Check environment variables, restart the dev server, and try again.'
                : undefined
            }
          />
        }
      />

      {config?.endpoints ? <CarbonSutraEndpointTester endpoints={config.endpoints} /> : null}
    </ApiPlaygroundShell>
  );
}
