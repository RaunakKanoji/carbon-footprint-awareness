'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

export default function FoodCarbonEstimateCard({ result }: { result: unknown }) {
  const estimate = (result as { estimate?: { co2eKg?: number; quantityKg?: number; confidence?: string; factor?: { name?: string; climateChangeKgCo2ePerKg?: number; version?: string } } } | null)?.estimate;
  if (!estimate) return null;

  return (
    <Card>
      <CardHeader><CardTitle>{estimate.factor?.name ?? 'Food estimate'}</CardTitle></CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-2xl font-bold">{estimate.co2eKg?.toFixed(2)} kg CO2e</p>
        <p>Quantity: {estimate.quantityKg} kg</p>
        <p>kg CO2e/kg: {estimate.factor?.climateChangeKgCo2ePerKg}</p>
        <p>Provider: Agribalyse</p>
        <p>Confidence: {estimate.confidence}</p>
        <p>Source version: {estimate.factor?.version ?? 'Unknown'}</p>
      </CardContent>
    </Card>
  );
}
