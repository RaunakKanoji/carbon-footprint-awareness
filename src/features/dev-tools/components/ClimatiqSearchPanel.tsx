'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

import JsonResponseViewer from './JsonResponseViewer';

type ClimatiqFactor = {
  id?: string;
  activity_id?: string;
  name?: string;
  region?: string;
  year?: number;
  source?: string;
  source_dataset?: string;
  unit_type?: string;
  category?: string;
  sector?: string;
  data_quality_flags?: string[];
};

function getResults(response: unknown): ClimatiqFactor[] {
  if (typeof response !== 'object' || response === null) {
    return [];
  }

  const data = response as { rawResponse?: { results?: ClimatiqFactor[] } };
  return data.rawResponse?.results ?? [];
}

export default function ClimatiqSearchPanel({
  canRun,
  onUseEstimate,
  onSaveMapping,
}: {
  canRun: boolean;
  onUseEstimate: (factor: ClimatiqFactor) => void;
  onSaveMapping: (factor: ClimatiqFactor) => void;
}) {
  const [query, setQuery] = useState('steel section');
  const [region, setRegion] = useState('');
  const [unitType, setUnitType] = useState('Weight');
  const [category, setCategory] = useState('');
  const [sector, setSector] = useState('');
  const [source, setSource] = useState('');
  const [year, setYear] = useState('');
  const [resultsPerPage, setResultsPerPage] = useState('5');
  const [page, setPage] = useState('1');
  const [response, setResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runSearch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dev/climatiq/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          region: region || undefined,
          unit_type: unitType || undefined,
          category: category || undefined,
          sector: sector || undefined,
          source: source || undefined,
          year: year ? Number(year) : undefined,
          results_per_page: Number(resultsPerPage),
          page: Number(page),
        }),
      });
      setResponse(await res.json());
    } catch (error) {
      setResponse({ ok: false, error: error instanceof Error ? error.message : 'Search failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const results = getResults(response);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Search emission factors</CardTitle>
          <CardDescription>Find Climatiq factors to test and save as mappings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Query" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Region" />
            <Input value={unitType} onChange={(event) => setUnitType(event.target.value)} placeholder="Unit Type" />
            <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
            <Input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Sector" />
            <Input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Source" />
            <Input value={year} onChange={(event) => setYear(event.target.value)} placeholder="Year" />
            <Input value={resultsPerPage} onChange={(event) => setResultsPerPage(event.target.value)} placeholder="Results per page" />
            <Input value={page} onChange={(event) => setPage(event.target.value)} placeholder="Page" />
          </div>
          <Button type="button" onClick={runSearch} disabled={!canRun || isSubmitting}>
            {isSubmitting ? 'Searching...' : 'Search factors'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Copy IDs, test an estimate, or save a mapping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[360px] overflow-auto rounded-lg border border-border-default">
            {results.length === 0 ? (
              <p className="p-3 text-sm text-text-secondary">No search results yet.</p>
            ) : (
              <div className="divide-y divide-border-default">
                {results.map((factor, index) => (
                  <div key={`${factor.id}-${index}`} className="space-y-2 p-3 text-sm">
                    <div>
                      <p className="font-semibold text-text-primary">{factor.name ?? factor.activity_id}</p>
                      <p className="text-text-secondary">
                        {factor.activity_id} · {factor.id} · {factor.region ?? 'Any region'} · {factor.year ?? 'Any year'}
                      </p>
                      <p className="text-text-secondary">
                        {factor.source} / {factor.source_dataset} · {factor.unit_type} · {factor.category} · {factor.sector}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(factor.activity_id ?? '')}>
                        Copy activity_id
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(factor.id ?? '')}>
                        Copy factor id
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => onUseEstimate(factor)}>
                        Use in Estimate
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => onSaveMapping(factor)}>
                        Save as Mapping
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <JsonResponseViewer value={response} onClear={() => setResponse(null)} />
        </CardContent>
      </Card>
    </div>
  );
}
