'use client';

import {
  AlertTriangle,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock,
  Leaf,
  Loader2,
  PackagePlus,
  Recycle,
  Sparkles,
} from 'lucide-react';

import { useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export type OwnedProductItem = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  estimatedFootprintKg: number;
  purchaseDate: string | null;
  condition: string | null;
  usageFrequency: string | null;
  expectedLifetimeMonths: number | null;
  notes: string | null;
  dataSource: string;
  confidence: string;
  createdAt: string;
  updatedAt: string;
};

const suggestedCategories = [
  'Electronics',
  'Clothing',
  'Furniture',
  'Appliance',
  'Kitchen',
  'Sports',
  'Books',
  'Other',
];

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Unknown';

  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return 'Not added';

  const [year, month, day] = value.slice(0, 10).split('-');

  if (!year || !month || !day) return value.slice(0, 10);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${day} ${monthNames[Number(month) - 1] ?? month} ${year}`;
}

function getMonthlyImpact(product: OwnedProductItem) {
  const months = Math.max(1, product.expectedLifetimeMonths ?? 12);
  return product.estimatedFootprintKg / months;
}

function getExtendedLifetimeImpact(product: OwnedProductItem) {
  const currentMonths = Math.max(1, product.expectedLifetimeMonths ?? 12);
  const extendedMonths = currentMonths + 12;
  const currentMonthlyImpact = product.estimatedFootprintKg / currentMonths;
  const extendedMonthlyImpact = product.estimatedFootprintKg / extendedMonths;

  return Math.max(0, currentMonthlyImpact - extendedMonthlyImpact);
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-text-primary">{value}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-text-secondary">{helper}</p>
    </div>
  );
}

export default function OwnedProductsClient({
  initialProducts,
}: {
  initialProducts: OwnedProductItem[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [lifetime, setLifetime] = useState('24');
  const [isSaving, setIsSaving] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const totalFootprintKg = useMemo(
    () => products.reduce((total, product) => total + product.estimatedFootprintKg, 0),
    [products],
  );

  const monthlyImpactKg = useMemo(
    () => products.reduce((total, product) => total + getMonthlyImpact(product), 0),
    [products],
  );

  const bestExtensionSavingsKg = useMemo(() => {
    if (products.length === 0) return 0;

    return Math.max(...products.map(getExtendedLifetimeImpact));
  }, [products]);

  async function addProduct() {
    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const expectedLifetimeMonths = Number(lifetime);

    if (!cleanName) {
      setErrorInfo('Enter a product name first.');
      return;
    }

    if (!cleanCategory) {
      setErrorInfo('Enter a product category.');
      return;
    }

    if (!expectedLifetimeMonths || expectedLifetimeMonths <= 0) {
      setErrorInfo('Expected lifetime must be greater than 0 months.');
      return;
    }

    setIsSaving(true);
    setErrorInfo(null);
    setSuccessInfo(null);

    try {
      const response = await fetch('/api/products/owned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          category: cleanCategory,
          expectedLifetimeMonths,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Could not add this product.');
      }

      const createdProduct: OwnedProductItem = {
        id: data.product.id,
        name: data.product.name,
        category: data.product.category,
        brand: data.product.brand ?? null,
        estimatedFootprintKg: data.product.estimatedFootprintKg,
        purchaseDate: data.product.purchaseDate ?? null,
        condition: data.product.condition ?? null,
        usageFrequency: data.product.usageFrequency ?? null,
        expectedLifetimeMonths: data.product.expectedLifetimeMonths ?? expectedLifetimeMonths,
        notes: data.product.notes ?? null,
        dataSource: data.product.dataSource ?? 'Carbon Compass estimate',
        confidence: String(data.product.confidence ?? 'LOW'),
        createdAt: data.product.createdAt,
        updatedAt: data.product.updatedAt ?? data.product.createdAt,
      };

      setProducts((current) => [createdProduct, ...current]);
      setName('');
      setSuccessInfo(`${createdProduct.name} was added to your lifetime tracker.`);
    } catch (error) {
      setErrorInfo(error instanceof Error ? error.message : 'Could not add this product.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Box}
          label="Owned Items"
          value={`${products.length}`}
          helper="Products you are tracking over their lifetime."
        />

        <StatCard
          icon={Leaf}
          label="Total Footprint"
          value={`${totalFootprintKg.toFixed(1)} kg`}
          helper="Estimated embodied footprint of your saved products."
        />

        <StatCard
          icon={Recycle}
          label="Best Extension"
          value={`${bestExtensionSavingsKg.toFixed(2)} kg/mo`}
          helper="Largest monthly reduction from keeping one item 12 months longer."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
          <div className="border-b border-border-subtle p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <PackagePlus className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  Add Product
                </p>

                <h2 className="text-xl font-black tracking-tight text-text-primary">
                  Track a product you own
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Add products you already own. Carbon Compass estimates the embodied footprint and
              spreads it across the expected lifetime.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <label className="grid gap-2 text-sm font-bold text-text-primary">
              Product name
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Sony headphones"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-text-primary">
              Category
              <Input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Example: Electronics"
                list="owned-product-categories"
              />
              <datalist id="owned-product-categories">
                {suggestedCategories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>

            <label className="grid gap-2 text-sm font-bold text-text-primary">
              Expected lifetime in months
              <Input
                type="number"
                min="1"
                step="1"
                value={lifetime}
                onChange={(event) => setLifetime(event.target.value)}
                placeholder="24"
              />
              <span className="text-xs font-medium leading-5 text-text-secondary">
                Longer lifetime lowers the monthly footprint allocation.
              </span>
            </label>

            {errorInfo && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="leading-6">{errorInfo}</p>
              </div>
            )}

            {successInfo && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="leading-6">{successInfo}</p>
              </div>
            )}

            <Button type="button" className="w-full" onClick={addProduct} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Add Product
            </Button>
          </div>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
          <div className="border-b border-border-subtle p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  Product Library
                </p>

                <h2 className="text-2xl font-black tracking-tight text-text-primary">
                  Owned products
                </h2>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Items you are tracking for lifetime footprint allocation.
                </p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  Monthly Allocation
                </p>

                <p className="mt-1 text-lg font-black text-text-primary">
                  {monthlyImpactKg.toFixed(2)} kg CO₂e
                </p>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Box className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-black text-text-primary">No products saved yet</h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Add the first product you want to keep longer. Electronics, clothing, appliances,
                and furniture are good first examples.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {products.map((product) => {
                const months = Math.max(1, product.expectedLifetimeMonths ?? 12);
                const monthlyImpact = getMonthlyImpact(product);
                const extendedSavings = getExtendedLifetimeImpact(product);

                return (
                  <article key={product.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-text-primary">{product.name}</h3>

                          <span className="rounded-full border border-border-subtle bg-bg-base px-2.5 py-1 text-xs font-bold text-text-secondary">
                            {product.category}
                          </span>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                            {formatLabel(product.confidence)} confidence
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            Added {formatDate(product.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {months} month lifetime
                          </span>

                          <span>Source: {product.dataSource}</span>
                        </div>

                        {product.notes && (
                          <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {product.notes}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 lg:w-[440px]">
                        <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">
                            Total
                          </p>
                          <p className="mt-1 font-black text-text-primary">
                            {product.estimatedFootprintKg.toFixed(1)} kg
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border-subtle bg-bg-elevated/45 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">
                            Per Month
                          </p>
                          <p className="mt-1 font-black text-text-primary">
                            {monthlyImpact.toFixed(2)} kg
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                            +12 mo saves
                          </p>
                          <p className="mt-1 font-black text-text-primary">
                            {extendedSavings.toFixed(2)} kg/mo
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 rounded-2xl border border-border-subtle bg-bg-elevated/45 p-3 text-sm leading-6 text-text-secondary">
                      Keeping this product longer reduces the monthly impact because the embodied
                      footprint is spread across more months of use.
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}