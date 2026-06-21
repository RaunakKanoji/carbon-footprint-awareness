'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export default function FoodFactorSearch({ onSelect }: { onSelect?: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; climateChangeKgCo2ePerKg: number }>>([]);

  async function search() {
    const res = await fetch(`/api/food/agribalyse/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results ?? []);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food factors" /><Button type="button" onClick={search}>Search</Button></div>
      <div className="space-y-2">
        {results.map((result) => (
          <button key={result.id} type="button" className="block w-full rounded-lg border border-border-default p-3 text-left text-sm" onClick={() => onSelect?.(result.id)}>
            {result.name} · {result.climateChangeKgCo2ePerKg} kg CO2e/kg
          </button>
        ))}
      </div>
    </div>
  );
}
