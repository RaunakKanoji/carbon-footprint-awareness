'use client';

import { AlertTriangle, Database, Leaf, Scale, ShieldCheck } from 'lucide-react';

export type ProductCarbonEstimateResult = {
  status?: string;
  estimate?: {
    co2eKg?: number;
    provider?: string;
    confidence?: string;
    factorLabel?: string;
    factorSource?: string;
    sourceLabel?: string;
    fallbackUsed?: boolean;
    explanation?: string;
  };
  message?: string;
  quantityKg?: number;
};

function formatLabel(value?: string) {
  if (!value) return 'Unknown';

  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EstimateDetail({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-text-muted" />
        <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</p>
      </div>

      <p className="mt-2 text-sm font-bold leading-6 text-text-primary">{value}</p>
    </div>
  );
}

export default function ProductCarbonEstimateCard({
  result,
}: {
  result: ProductCarbonEstimateResult | null;
}) {
  if (!result) {
    return null;
  }

  if (result.status !== 'ESTIMATED') {
    return (
      <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-text-primary">Carbon estimate unavailable</h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {result.message ||
                'We found this product, but we do not yet have a verified carbon factor for its category.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">

      <div className="relative border-b border-border-subtle p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Result</p>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary">
              Product footprint
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Estimated footprint for the selected product quantity.
            </p>
          </div>

          {result.estimate?.fallbackUsed && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 ring-1 ring-amber-100">
              <AlertTriangle className="h-4 w-4" />
              Category fallback
            </span>
          )}
        </div>
      </div>

      <div className="relative grid gap-5 p-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-emerald-700 ring-1 ring-emerald-100">
            <Leaf className="h-6 w-6" />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            Estimated Impact
          </p>

          <p className="mt-2 text-4xl font-black tracking-tight text-text-primary">
            {result.estimate?.co2eKg?.toFixed(2) ?? '0.00'}
          </p>

          <p className="text-sm font-bold text-text-secondary">kg CO₂e</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <EstimateDetail
            icon={Database}
            label="Provider"
            value={formatLabel(result.estimate?.provider)}
          />

          <EstimateDetail
            icon={ShieldCheck}
            label="Confidence"
            value={formatLabel(result.estimate?.confidence)}
          />

          <EstimateDetail
            icon={Scale}
            label="Quantity Used"
            value={result.quantityKg ? `${result.quantityKg} kg` : 'Mapped default'}
          />

          <EstimateDetail
            icon={Database}
            label="Factor"
            value={result.estimate?.factorLabel || result.estimate?.factorSource || 'Not stored'}
          />

          {result.estimate?.sourceLabel && (
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Source
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-text-primary">
                {result.estimate.sourceLabel}
              </p>
            </div>
          )}

          {result.estimate?.explanation && (
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Explanation
              </p>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {result.estimate.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
