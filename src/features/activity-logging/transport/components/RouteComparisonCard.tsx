'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

export type RouteComparisonResult = {
  profile: string;
  distanceKm: number;
  durationMinutes: number;
  success: boolean;
  error?: string;
};

export default function RouteComparisonCard({
  comparison,
}: {
  comparison: RouteComparisonResult[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode comparison</CardTitle>
        <CardDescription>Compare route profiles before logging a commute.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {comparison.length === 0 ? (
          <p className="text-sm text-text-secondary">No comparison calculated yet.</p>
        ) : (
          comparison.map((item) => (
            <div
              key={item.profile}
              className="grid gap-2 rounded-lg border border-border-default bg-bg-base p-3 text-sm sm:grid-cols-[1fr_auto_auto]"
            >
              <span className="font-semibold text-text-primary">{item.profile.replaceAll('-', ' ')}</span>
              {item.success ? (
                <>
                  <span className="text-text-secondary">{item.distanceKm.toFixed(2)} km</span>
                  <span className="text-text-secondary">{item.durationMinutes.toFixed(0)} min</span>
                </>
              ) : (
                <span className="text-state-error sm:col-span-2">{item.error ?? 'Comparison failed'}</span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
