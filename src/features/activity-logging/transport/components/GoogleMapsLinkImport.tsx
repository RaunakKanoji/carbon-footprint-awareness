'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

type ParsedGoogleMapsLink =
  | { type: 'directions'; originText?: string; destinationText?: string; rawUrl: string }
  | { type: 'place'; placeText?: string; rawUrl: string }
  | { type: 'unknown'; rawUrl: string };

export default function GoogleMapsLinkImport({
  onUseDirections,
}: {
  onUseDirections: (originText: string, destinationText: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedGoogleMapsLink | null>(null);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const importLink = async () => {
    setIsImporting(true);
    setError('');
    setParsed(null);

    try {
      const res = await fetch('/api/location/import-google-maps-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { ok: boolean; parsed?: ParsedGoogleMapsLink; error?: string };
      if (!data.ok || !data.parsed) {
        throw new Error(data.error ?? 'Could not import Google Maps link');
      }
      setParsed(data.parsed);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Could not import Google Maps link');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Google Maps link</CardTitle>
        <CardDescription>Paste a directions URL to prefill origin and destination labels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.google.com/maps/dir/..."
          />
          <Button type="button" variant="outline" onClick={importLink} disabled={isImporting || !url.trim()}>
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </div>

        {error ? <p className="text-sm font-medium text-state-error">{error}</p> : null}

        {parsed?.type === 'directions' ? (
          <div className="space-y-2 rounded-lg border border-border-default bg-bg-base p-3 text-sm">
            <p className="font-semibold text-text-primary">Directions found</p>
            <p className="text-text-secondary">
              {parsed.originText ?? 'Unknown origin'} to {parsed.destinationText ?? 'unknown destination'}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => onUseDirections(parsed.originText ?? '', parsed.destinationText ?? '')}
              disabled={!parsed.originText || !parsed.destinationText}
            >
              Use in planner
            </Button>
          </div>
        ) : null}

        {parsed?.type === 'place' ? (
          <p className="rounded-lg border border-border-default bg-bg-base p-3 text-sm text-text-secondary">
            Place link parsed: {parsed.placeText}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
