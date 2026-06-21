'use client';

import { useState } from 'react';

import FoodCarbonEstimateCard from '@/src/features/activity-logging/food/components/FoodCarbonEstimateCard';
import FoodFactorSearch from '@/src/features/activity-logging/food/components/FoodFactorSearch';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export default function FoodEstimateForm() {
  const [factorId, setFactorId] = useState('');
  const [quantityKg, setQuantityKg] = useState('0.25');
  const [result, setResult] = useState<unknown>(null);

  async function estimate() {
    const res = await fetch('/api/food/agribalyse/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factorId, quantityKg: Number(quantityKg), createActivityLog: true }),
    });
    setResult(await res.json());
  }

  return (
    <div className="space-y-4">
      <FoodFactorSearch onSelect={setFactorId} />
      <Input value={factorId} onChange={(event) => setFactorId(event.target.value)} placeholder="Agribalyse factor ID" />
      <Input value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} type="number" min="0.001" step="0.001" placeholder="Quantity kg" />
      <Button type="button" onClick={estimate} disabled={!factorId}>Estimate carbon</Button>
      <FoodCarbonEstimateCard result={result} />
    </div>
  );
}
