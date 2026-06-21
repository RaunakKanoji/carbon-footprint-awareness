'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import JsonResponseViewer from './JsonResponseViewer';

type Mapping = {
  id: string;
  label: string;
  appCategory: string;
  appActivityType: string;
  climatiqActivityId?: string | null;
  climatiqFactorId?: string | null;
  climatiqDataVersion: string;
  climatiqRegion?: string | null;
  unitType?: string | null;
  isActive: boolean;
};

type MappingDraft = {
  id?: string;
  label: string;
  appCategory: string;
  appActivityType: string;
  climatiqActivityId: string;
  climatiqFactorId: string;
  climatiqDataVersion: string;
  climatiqRegion: string;
  unitType: string;
};

const EMPTY_DRAFT: MappingDraft = {
  label: '',
  appCategory: 'TRANSPORT',
  appActivityType: 'transport.car.average',
  climatiqActivityId: '',
  climatiqFactorId: '',
  climatiqDataVersion: '^33',
  climatiqRegion: 'IN',
  unitType: 'Distance',
};

export default function ClimatiqFactorMappingPanel({
  canRun,
  draft,
  onDraftChange,
}: {
  canRun: boolean;
  draft?: Partial<MappingDraft>;
  onDraftChange?: (draft: Partial<MappingDraft>) => void;
}) {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [localDraft, setLocalDraft] = useState<MappingDraft>(EMPTY_DRAFT);
  const [message, setMessage] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<unknown>(null);

  const currentDraft = { ...localDraft, ...draft };

  const updateDraft = (patch: Partial<MappingDraft>) => {
    setLocalDraft((current) => ({ ...current, ...patch }));
    onDraftChange?.({ ...currentDraft, ...patch });
  };

  const loadMappings = async () => {
    const res = await fetch('/api/dev/climatiq/mappings');
    const data = await res.json();
    setMappings(data.mappings ?? []);
  };

  useEffect(() => {
    if (canRun) {
      fetch('/api/dev/climatiq/mappings')
        .then((res) => res.json())
        .then((data) => setMappings(data.mappings ?? []))
        .catch(() => setMappings([]));
    }
  }, [canRun]);

  const saveMapping = async () => {
    setMessage(null);
    const res = await fetch('/api/dev/climatiq/mappings', {
      method: currentDraft.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentDraft),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Could not save mapping');
      return;
    }
    setMessage('Mapping saved');
    await loadMappings();
  };

  const testMapping = async (mapping: Mapping) => {
    const unitType = mapping.unitType?.toLowerCase();
    const parameters =
      unitType === 'distance'
        ? { distance: 12, distance_unit: 'km' }
        : unitType === 'energy'
          ? { energy: 180, energy_unit: 'kWh' }
          : unitType === 'money'
            ? { money: 2500, money_unit: 'inr' }
            : unitType === 'volume'
              ? { volume: 20, volume_unit: 'l' }
              : { weight: 100, weight_unit: 'kg' };

    const res = await fetch('/api/dev/climatiq/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          emission_factor: {
            activity_id: mapping.climatiqActivityId,
            id: mapping.climatiqFactorId || undefined,
            data_version: mapping.climatiqDataVersion,
            region: mapping.climatiqRegion || undefined,
          },
          parameters,
        },
        useCache: true,
      }),
    });
    setTestResponse(await res.json());
  };

  const deactivate = async (id: string) => {
    const res = await fetch(`/api/dev/climatiq/mappings?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    setMessage(data.ok ? 'Mapping deactivated' : data.error ?? 'Could not deactivate mapping');
    await loadMappings();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Save mapping</CardTitle>
          <CardDescription>Connect app activity types to real Climatiq emission factors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={currentDraft.label ?? ''} onChange={(event) => updateDraft({ label: event.target.value })} placeholder="Label" />
          <Input value={currentDraft.appCategory ?? ''} onChange={(event) => updateDraft({ appCategory: event.target.value })} placeholder="App Category" />
          <Input value={currentDraft.appActivityType ?? ''} onChange={(event) => updateDraft({ appActivityType: event.target.value })} placeholder="Mapping key" />
          <Input value={currentDraft.climatiqActivityId ?? ''} onChange={(event) => updateDraft({ climatiqActivityId: event.target.value })} placeholder="Climatiq activity ID" />
          <Input value={currentDraft.climatiqFactorId ?? ''} onChange={(event) => updateDraft({ climatiqFactorId: event.target.value })} placeholder="Climatiq factor ID" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input value={currentDraft.climatiqDataVersion ?? ''} onChange={(event) => updateDraft({ climatiqDataVersion: event.target.value })} placeholder="Data version" />
            <Input value={currentDraft.climatiqRegion ?? ''} onChange={(event) => updateDraft({ climatiqRegion: event.target.value })} placeholder="Region" />
            <Input value={currentDraft.unitType ?? ''} onChange={(event) => updateDraft({ unitType: event.target.value })} placeholder="Unit Type" />
          </div>
          {message ? <p className="text-sm font-medium text-text-secondary">{message}</p> : null}
          <Button type="button" onClick={saveMapping} disabled={!canRun}>
            Save mapping
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved mappings</CardTitle>
          <CardDescription>Active mappings are used by the normal activity form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[520px] overflow-auto rounded-lg border border-border-default">
            {mappings.length === 0 ? (
              <p className="p-3 text-sm text-text-secondary">No saved mappings yet.</p>
            ) : (
              <div className="divide-y divide-border-default">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="grid gap-2 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{mapping.label}</p>
                        <p className="text-text-secondary">
                          {mapping.appCategory} · {mapping.appActivityType} · {mapping.unitType ?? 'Any unit'}
                        </p>
                        <p className="text-text-secondary">
                          {mapping.climatiqActivityId} · {mapping.climatiqFactorId ?? 'No factor ID'} · {mapping.climatiqRegion ?? 'Any region'} · {mapping.climatiqDataVersion}
                        </p>
                      </div>
                      <span className={mapping.isActive ? 'font-semibold text-accent-primary' : 'font-semibold text-state-error'}>
                        {mapping.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => updateDraft({
                        id: mapping.id,
                        label: mapping.label,
                        appCategory: mapping.appCategory,
                        appActivityType: mapping.appActivityType,
                        climatiqActivityId: mapping.climatiqActivityId ?? '',
                        climatiqFactorId: mapping.climatiqFactorId ?? '',
                        climatiqDataVersion: mapping.climatiqDataVersion,
                        climatiqRegion: mapping.climatiqRegion ?? '',
                        unitType: mapping.unitType ?? '',
                      })}>
                        Edit
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => testMapping(mapping)}>
                        Test Mapping
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => deactivate(mapping.id)}>
                        Deactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3">
            <JsonResponseViewer value={testResponse} onClear={() => setTestResponse(null)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
