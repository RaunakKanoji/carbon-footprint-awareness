'use client';

import { useState } from 'react';
import { Barcode, Search } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export default function BarcodeManualInput({
  onLookup,
  isLoading,
}: {
  onLookup: (barcode: string) => void;
  isLoading?: boolean;
}) {
  const [barcode, setBarcode] = useState('');

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          onLookup(barcode);
        }}
      >
        <label className="grid gap-1 text-sm font-medium">
          Barcode number
          <Input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            inputMode="numeric"
            placeholder="Enter barcode number"
            className="h-10"
          />
        </label>

        <Button
          type="submit"
          className="h-10 shrink-0 !gap-0 px-4 self-end"
          disabled={isLoading || !barcode.trim()}
        >
          <Search className="mr-2 h-4 w-4" />
          Lookup
        </Button>
      </form>

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Barcode className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-black text-text-primary">Manual lookup</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Use this when the barcode number is printed clearly below the product barcode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}