'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { formatCo2eKg } from '@/src/lib/format-carbon';

type CarbonResultCardProps = {
  result: {
    activity?: {
      category: string;
      activityType: string;
      co2eKg: number;
      provider: string;
    };
    estimate?: {
      co2eKg: number;
      fromCache: boolean;
    };
  } | null;
};

export default function CarbonResultCard({ result }: CarbonResultCardProps) {
  if (!result?.estimate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculated footprint</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-3xl font-black text-text-primary">
          {formatCo2eKg(result.estimate.co2eKg)}{' '}
          <span className="text-sm font-medium text-text-secondary">kg CO₂e</span>
        </p>
        <p className="text-text-secondary">
          Provider: {result.activity?.provider ?? 'CARBON_INTERFACE'} · Cache:{' '}
          {result.estimate.fromCache ? 'Hit' : 'Miss'}
        </p>
      </CardContent>
    </Card>
  );
}
