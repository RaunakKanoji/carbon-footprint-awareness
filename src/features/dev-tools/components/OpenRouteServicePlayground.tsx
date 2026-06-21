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
import OpenRouteServiceEndpointTester from './OpenRouteServiceEndpointTester';

type ConfigResponse = {
  enabled: boolean;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
  missingVariables?: string[];
  endpoints: Array<{ endpoint: string; configured: boolean }>;
  error?: string;
};

export default function OpenRouteServicePlayground() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);

  useEffect(() => {
    fetch('/api/dev/openrouteservice/config')
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
          ...config.endpoints.map((item): StatusRow => ({
            label: `${item.endpoint} endpoint`,
            status: item.configured ? 'configured' : 'missing',
          })),
        ]
      : [];

  return (
    <ApiPlaygroundShell
      title="OpenRouteService Playground"
      description="Test geocoding, reverse geocoding, route distance, matrix, route comparison, and Google Maps link import."
      providerType="Distance, geocoding, and routing provider"
      status={canRun ? 'configured' : config ? 'missing' : 'optional'}
      badges={['Support provider', 'Distance only', 'Live API']}
    >
      <ApiOverviewGrid
        purpose={
          <ApiPurposeCard
            items={[
              'Geocode addresses',
              'Reverse geocode coordinates',
              'Calculate route distance and duration',
              'Compare car, bike, and walking routes',
            ]}
            warning="OpenRouteService calculates distance, not final carbon emissions."
          />
        }
        flow={
          <ApiAppFlowCard
            steps={[
              'User enters origin and destination',
              'OpenRouteService calculates distance and duration',
              'CarbonSutra or Climatiq calculates CO2e from the distance',
              'ActivityLog saves the route-based emission when the user confirms',
              'Dashboard updates from stored ActivityLog values',
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
                ? `Configure ${config.missingVariables.join(', ')} before running OpenRouteService tests.`
                : undefined
            }
          />
        }
      />

      <DocsHintCard>
        <p>Coordinate format matters: app input is {'{ lat, lng }'}, while OpenRouteService payloads use [lng, lat]. Walking and cycling have 0 direct CO2e in the app flow.</p>
      </DocsHintCard>

      <OpenRouteServiceEndpointTester
        canRun={canRun}
        missingVariables={config?.missingVariables?.filter((value): value is string => Boolean(value)) ?? []}
      />
    </ApiPlaygroundShell>
  );
}
