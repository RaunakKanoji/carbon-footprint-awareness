'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export type SavedPlace = {
  id: string;
  label: string;
  name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
};

export default function SavedPlaceSelector({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (place: SavedPlace) => void;
}) {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [placeLabel, setPlaceLabel] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPlaces = async () => {
    const res = await fetch('/api/location/saved-places');
    const data = (await res.json()) as { places?: SavedPlace[] };
    setPlaces(data.places ?? []);
  };

  useEffect(() => {
    void fetch('/api/location/saved-places')
      .then((res) => res.json())
      .then((data: { places?: SavedPlace[] }) => setPlaces(data.places ?? []))
      .catch(() => setPlaces([]));
  }, []);

  const savePlace = async () => {
    setIsSaving(true);
    setStatus('');

    try {
      const geocodeRes = await fetch('/api/location/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: address, size: 1 }),
      });
      const geocodeData = (await geocodeRes.json()) as {
        ok: boolean;
        results?: Array<{ lat: number; lng: number; label?: string; address?: string }>;
        error?: string;
      };

      const match = geocodeData.results?.[0];
      if (!geocodeData.ok || !match) {
        throw new Error(geocodeData.error ?? 'Could not geocode saved place');
      }

      const saveRes = await fetch('/api/location/saved-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: placeLabel || match.label || address,
          address: match.address ?? address,
          latitude: match.lat,
          longitude: match.lng,
          source: 'OPENROUTESERVICE',
        }),
      });
      const saveData = (await saveRes.json()) as { ok: boolean; place?: SavedPlace; error?: string };
      if (!saveData.ok || !saveData.place) {
        throw new Error(saveData.error ?? 'Could not save place');
      }

      setPlaceLabel('');
      setAddress('');
      setStatus('Saved');
      await loadPlaces();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save place');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border-default bg-bg-surface p-3">
      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
        <select
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm font-medium text-text-primary"
          defaultValue=""
          onChange={(event) => {
            const place = places.find((item) => item.id === event.target.value);
            if (place) onSelect(place);
          }}
        >
          <option value="">Select saved place</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)_auto]">
        <Input
          value={placeLabel}
          onChange={(event) => setPlaceLabel(event.target.value)}
          placeholder="Home"
        />
        <Input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Address to save"
        />
        <Button type="button" variant="outline" onClick={savePlace} disabled={isSaving || !address.trim()}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {status ? <p className="text-xs font-medium text-text-secondary">{status}</p> : null}
    </div>
  );
}
