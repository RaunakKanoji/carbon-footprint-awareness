import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { getProductByBarcode } from '@/src/server/products/open-food-facts.service';
import { normalizeBarcode } from '@/src/integrations/open-food-facts/validators';

export type ProductScanSource = 'BARCODE' | 'MANUAL' | 'SEARCH' | 'RECEIPT';
export type ProductScanContext =
  | 'MEAL_LOG'
  | 'SHOPPING'
  | 'PANTRY'
  | 'RECEIPT'
  | 'POINT_OF_PURCHASE';

function getProductScanDelegate() {
  if (!prisma.productScan) {
    throw new Error(
      'Product scan storage is unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.productScan;
}

function getFoodProductDelegate() {
  if (!prisma.foodProduct) {
    throw new Error(
      'Food product storage is unavailable. Restart the Next.js dev server after running npx prisma generate, then apply the Open Food Facts migration.',
    );
  }

  return prisma.foodProduct;
}

export async function recordProductScan(input: {
  userId: string;
  barcode: string;
  scanSource?: ProductScanSource;
  scanContext?: ProductScanContext;
}) {
  const { product } = await getProductByBarcode({ barcode: input.barcode });
  const savedProduct = product.found
    ? await getFoodProductDelegate().findUnique({ where: { barcode: product.barcode } })
    : null;

  const scan = await getProductScanDelegate().create({
    data: {
      userId: input.userId,
      barcode: normalizeBarcode(input.barcode),
      foodProductId: savedProduct?.id,
      productName: product.productName,
      brand: product.brand,
      imageUrl: product.imageUrl,
      scanSource: input.scanSource ?? 'BARCODE',
      scanContext: input.scanContext,
      metadata: {
        found: product.found,
        categories: product.categories,
        categoryTags: product.categoryTags,
      } as Prisma.InputJsonValue,
    },
  });

  return { scan, product };
}

export async function getRecentProductScans(userId: string, limit = 10) {
  return getProductScanDelegate().findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function deleteProductScan(input: { userId: string; scanId: string }) {
  return getProductScanDelegate().delete({
    where: {
      id: input.scanId,
      userId: input.userId,
    },
  });
}
