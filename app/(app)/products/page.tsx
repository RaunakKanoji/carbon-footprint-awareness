import { ArrowRight, Barcode, PackageSearch, ShoppingBag } from 'lucide-react';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { ProductScannerClient } from '@/src/features/products/components';
import { getCurrentUser } from '@/src/lib/auth';
import { getRecentProductScans } from '@/src/server/products/product-scan.service';

export default async function ProductsPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const scans = await getRecentProductScans(dbUser.id, 10);

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Product Scanner
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              Check the carbon impact before you buy
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Scan packaged food barcodes, estimate product footprints, and save useful product
              activity into your carbon history.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <Barcode className="h-4 w-4 text-emerald-600" />
                Barcode lookup
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <PackageSearch className="h-4 w-4 text-indigo-600" />
                Category fallback
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <ShoppingBag className="h-4 w-4 text-amber-600" />
                Owned products
              </div>
            </div>
          </div>

          <Link
            className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}
            href="/products/owned"
          >
            My Owned Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <ProductScannerClient
        initialScans={scans.map((scan) => ({
          id: scan.id,
          productName: scan.productName,
          brand: scan.brand,
          barcode: scan.barcode,
          carbonEstimated: scan.carbonEstimated,
          createdAt: scan.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
