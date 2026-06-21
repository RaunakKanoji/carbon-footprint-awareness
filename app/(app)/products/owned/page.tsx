import { ArrowLeft, Box, CalendarDays, Leaf, PackageCheck } from 'lucide-react';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import OwnedProductsClient, {
  type OwnedProductItem,
} from '@/src/features/products/components/OwnedProductsClient';
import { getCurrentUser } from '@/src/lib/auth';
import { prisma } from '@/src/db/prisma';

export default async function OwnedProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  if (!user.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  const products = await prisma.ownedProduct.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      category: true,
      brand: true,
      estimatedFootprintKg: true,
      purchaseDate: true,
      condition: true,
      usageFrequency: true,
      expectedLifetimeMonths: true,
      notes: true,
      dataSource: true,
      confidence: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const initialProducts: OwnedProductItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    estimatedFootprintKg: product.estimatedFootprintKg,
    purchaseDate: product.purchaseDate ? product.purchaseDate.toISOString() : null,
    condition: product.condition,
    usageFrequency: product.usageFrequency,
    expectedLifetimeMonths: product.expectedLifetimeMonths,
    notes: product.notes,
    dataSource: product.dataSource,
    confidence: String(product.confidence),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  const totalFootprintKg = initialProducts.reduce(
    (total, product) => total + product.estimatedFootprintKg,
    0,
  );

  const monthlyImpactKg = initialProducts.reduce((total, product) => {
    const months = Math.max(1, product.expectedLifetimeMonths ?? 12);
    return total + product.estimatedFootprintKg / months;
  }, 0);

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Link
              href="/products"
              className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to product scanner
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
              Product Lifetime Tracker
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
              Make product ownership count
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Track products you own and see how keeping them longer spreads their footprint across
              more months.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <Box className="h-4 w-4 text-emerald-600" />
                {initialProducts.length} saved products
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <Leaf className="h-4 w-4 text-emerald-600" />
                {totalFootprintKg.toFixed(1)} kg CO₂e tracked
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                {monthlyImpactKg.toFixed(1)} kg/month
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Scan Product
          </Link>
        </div>
      </section>

      <OwnedProductsClient initialProducts={initialProducts} />
    </div>
  );
}
