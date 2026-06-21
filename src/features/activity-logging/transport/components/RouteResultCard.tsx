'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { formatCo2eKg } from '@/src/lib/format-carbon';

export type RouteResult = {
  profile: string;
  distanceKm: number;
  durationMinutes: number;
  fromCache: boolean;
};

export default function RouteResultCard({
  route,
  carbonKg,
  isLogging,
  onLogCarbon,
}: {
  route: RouteResult | null;
  carbonKg?: number;
  isLogging?: boolean;
  onLogCarbon?: () => void;
}) {
  if (!route) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route estimate</CardTitle>
          <CardDescription>Plan a route to see distance, duration, cache status, and emissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">No route calculated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route estimate</CardTitle>
        <CardDescription>{route.profile.replaceAll('-', ' ')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-default bg-bg-base p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Distance</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{route.distanceKm.toFixed(2)} km</p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-base p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Duration</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{route.durationMinutes.toFixed(0)} min</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm">
          <span className="text-text-secondary">Distance cache</span>
          <span className="font-semibold text-text-primary">{route.fromCache ? 'Hit' : 'Fresh'}</span>
        </div>

        {carbonKg !== undefined ? (
          <div className="flex items-center justify-between rounded-lg border border-accent-primary/30 bg-accent-primary-dim px-3 py-2 text-sm">
            <span className="text-text-secondary">Logged emissions</span>
            <span className="font-semibold text-accent-primary">{formatCo2eKg(carbonKg)} kg CO2e</span>
          </div>
        ) : null}

        {onLogCarbon ? (
          <Button type="button" onClick={onLogCarbon} disabled={isLogging}>
            {isLogging ? 'Logging...' : 'Log carbon activity'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
