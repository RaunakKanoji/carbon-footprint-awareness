'use client';

import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Info,
  Loader2,
  RotateCcw,
  ScanBarcode,
  Search,
  Sparkles,
} from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

import BarcodeScanner from './BarcodeScanner';
import ProductCarbonEstimateCard, {
  type ProductCarbonEstimateResult,
} from './ProductCarbonEstimateCard';
import ProductLookupCard, { type ProductLookupResult } from './ProductLookupCard';
import ProductScanHistory, { type ProductScanHistoryItem } from './ProductScanHistory';

export default function ProductScannerClient({
  initialScans,
}: {
  initialScans: ProductScanHistoryItem[];
}) {
  const [product, setProduct] = useState<ProductLookupResult | null>(null);
  const [estimate, setEstimate] = useState<ProductCarbonEstimateResult | null>(null);
  const [scans, setScans] = useState(initialScans);
  const [barcode, setBarcode] = useState('');
  const [quantityKg, setQuantityKg] = useState('0.4');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cleanBarcode = barcode.trim();
  const parsedQuantityKg = Number.parseFloat(quantityKg);

  const canEstimate = useMemo(() => {
    return Boolean(product?.found && cleanBarcode && parsedQuantityKg > 0);
  }, [cleanBarcode, parsedQuantityKg, product?.found]);

  const refreshScans = useCallback(async () => {
    const res = await fetch('/api/products/recent');

    if (res.ok) {
      const data = await res.json();
      setScans(data.scans ?? []);
    }
  }, []);

  async function lookup(nextBarcode: string) {
    const normalizedBarcode = nextBarcode.trim();

    if (!normalizedBarcode) {
      setError('Enter or scan a barcode first.');
      return;
    }

    setBarcode(normalizedBarcode);
    setIsLookingUp(true);
    setError(null);
    setSuccessMessage(null);
    setEstimate(null);

    try {
      const res = await fetch('/api/products/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: normalizedBarcode,
          scanSource: 'BARCODE',
          scanContext: 'SHOPPING',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not look up this product right now.');
      }

      setProduct(data.product ?? { found: false });
      setSuccessMessage(
        data.product?.found ? 'Product found.' : 'Product not found in Open Food Facts.',
      );

      await refreshScans();
    } catch (err) {
      setProduct(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not look up this product right now. Please try again.',
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  async function estimateCarbon(createActivityLog: boolean) {
    if (!cleanBarcode) {
      setError('Look up a product before estimating its footprint.');
      return;
    }

    if (!parsedQuantityKg || parsedQuantityKg <= 0) {
      setError('Enter a valid product weight in kilograms.');
      return;
    }

    setIsEstimating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/products/estimate-carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: cleanBarcode,
          quantityKg: parsedQuantityKg,
          scanContext: createActivityLog ? 'PRODUCT_LOG' : 'PRODUCT_ESTIMATE',
          createActivityLog,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Could not estimate this product.');
      }

      setEstimate(data);

      if (data.status === 'ESTIMATED') {
        setSuccessMessage(
          createActivityLog
            ? 'Product footprint estimated and saved to your activity history.'
            : 'Product footprint estimated.',
        );
      }

      await refreshScans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not estimate this product.');
    } finally {
      setIsEstimating(false);
    }
  }

  async function deleteScan(id: string) {
    const res = await fetch(`/api/products/scan?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setScans((current) => current.filter((scan) => scan.id !== id));
    }
  }

  function resetCurrentLookup() {
    setProduct(null);
    setEstimate(null);
    setBarcode('');
    setQuantityKg('0.4');
    setError(null);
    setSuccessMessage(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Step 1
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-text-primary">
                Find a product
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Enter the barcode manually or use scan mode. Both methods search the same product
                database.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-9 w-fit rounded-full px-3 text-sm"
              onClick={resetCurrentLookup}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-2">
            <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/45 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Barcode className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-black text-text-primary">
                    Enter your barcode
                  </h3>
                  <p className="text-sm text-text-secondary">Best when the number is readable.</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  inputMode="numeric"
                  placeholder="Enter barcode number"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      lookup(barcode);
                    }
                  }}
                  className="h-10"
                />

                <Button
                  type="button"
                  className="h-10 shrink-0 !gap-0 px-4"
                  onClick={() => lookup(barcode)}
                  disabled={isLookingUp || !barcode.trim()}
                >
                  {isLookingUp ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Lookup
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-border-subtle bg-bg-surface p-4">
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

            <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/45 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <ScanBarcode className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-base font-black text-text-primary">Scan your barcode</h3>
                  <p className="text-sm text-text-secondary">Best when packaging is nearby.</p>
                </div>
              </div>

              <div className="mt-4">
                <BarcodeScanner onBarcode={lookup} isLoading={isLookingUp} />
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle px-5 py-3">
            <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-elevated/40 px-4 py-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                <Info className="h-4 w-4" />
              </div>

              <p className="text-sm leading-6 text-text-secondary">
                Product metadata comes from Open Food Facts when available. If exact product
                footprint is unavailable, Carbon Compass estimates using the closest verified
                category.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="leading-6">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="leading-6">{successMessage}</p>
          </div>
        )}

        <ProductLookupCard product={product} />

        {product?.found && (
          <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Step 3
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-text-primary">
                Estimate product footprint
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Enter product weight, then test the estimate or save it as an activity log.
              </p>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-[220px_1fr]">
              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Product weight in kg
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={quantityKg}
                  onChange={(event) => setQuantityKg(event.target.value)}
                  className="h-10"
                />
                <span className="text-xs font-medium leading-5 text-text-secondary">
                  Example: 0.4 kg for a 400g packaged food item.
                </span>
              </label>

              <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 sm:w-fit"
                  onClick={() => estimateCarbon(false)}
                  disabled={isEstimating || !canEstimate}
                >
                  {isEstimating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Test estimate
                </Button>

                <Button
                  type="button"
                  className="h-10 sm:w-fit"
                  onClick={() => estimateCarbon(true)}
                  disabled={isEstimating || !canEstimate}
                >
                  {isEstimating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Estimate and log
                </Button>
              </div>
            </div>
          </section>
        )}

        <ProductCarbonEstimateCard result={estimate} />
      </div>

      <ProductScanHistory scans={scans} onDelete={deleteScan} />
    </div>
  );
}