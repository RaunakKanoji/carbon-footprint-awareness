'use client';

import { Barcode, ExternalLink, ImageIcon, Leaf, Package, ShieldCheck, Tags } from 'lucide-react';

import Image from 'next/image';

export type ProductLookupResult = {
  found: boolean;
  productName?: string;
  brand?: string;
  quantity?: string;
  categories?: string[];
  categoryTags?: string[];
  ecoScore?: string;
  nutriScore?: string;
  novaGroup?: number;
  greenScoreLabel?: string;
  environmentalImpactLabel?: string;
  carbonFootprintGPer100g?: number;
  carbonFootprintKgPerKg?: number;
  carbonFootprintDisplay?: string;
  carbonFootprintPetrolCarEquivalentDisplay?: string;
  carbonFootprintSource?: string;
  packagingTags?: string[];
  imageUrl?: string;
};

function formatTag(value: string) {
  return value
    .replace(/^en:/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ProductMetaItem({
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

export default function ProductLookupCard({ product }: { product: ProductLookupResult | null }) {
  if (!product) {
    return null;
  }

  if (!product.found) {
    return (
      <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <Barcode className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-text-primary">Product not found</h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              No Open Food Facts product exists for this barcode yet. You can still estimate using a
              category fallback later when product category data is available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const category =
    product.categories?.[0] || product.categoryTags?.[0] || 'Uncategorized product';

  const packaging =
    product.packagingTags && product.packagingTags.length > 0
      ? product.packagingTags.slice(0, 5).map(formatTag).join(', ')
      : 'No packaging information listed';

  return (
    <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
      <div className="border-b border-border-subtle p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Step 2</p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary">
          Product found
        </h2>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Review the product details before estimating its footprint.
        </p>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-border-default bg-bg-base">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.productName || 'Product image'}
              width={160}
              height={160}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-secondary">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs font-semibold">No image</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-text-primary">
                {product.productName || 'Unnamed product'}
              </h3>

              <p className="mt-1 text-sm font-semibold text-text-secondary">
                {product.brand || 'Unknown brand'} · {product.quantity || 'Unknown quantity'}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Open Food Facts
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProductMetaItem
              icon={Leaf}
              label="Environment"
              value={product.greenScoreLabel || product.ecoScore?.toUpperCase() || 'Unavailable'}
            />

            <ProductMetaItem
              icon={Package}
              label="Nutrition"
              value={`${product.nutriScore?.toUpperCase() || 'N/A'} / NOVA ${product.novaGroup ?? 'N/A'
                }`}
            />

            <ProductMetaItem icon={Tags} label="Category" value={formatTag(category)} />

            <ProductMetaItem icon={Package} label="Packaging" value={packaging} />
          </div>

          <div className="mt-4 rounded-2xl border border-border-subtle bg-bg-elevated/45 p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-text-muted" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                Product Carbon Data
              </p>
            </div>

            <p className="mt-2 text-sm font-bold leading-6 text-text-primary">
              {product.carbonFootprintDisplay
                ? `${product.carbonFootprintDisplay} · ${product.carbonFootprintSource || 'Open Food Facts'
                }`
                : 'No exact product footprint listed'}
            </p>

            {product.carbonFootprintPetrolCarEquivalentDisplay && (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Equivalent: {product.carbonFootprintPetrolCarEquivalentDisplay}
              </p>
            )}

            {product.environmentalImpactLabel && (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Impact: {product.environmentalImpactLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}