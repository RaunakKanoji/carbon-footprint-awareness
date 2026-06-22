-- AlterEnum
ALTER TYPE "CalculationProvider" ADD VALUE IF NOT EXISTS 'AGRIBALYSE';

-- CreateTable
CREATE TABLE "FoodProduct" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "productName" TEXT,
    "brand" TEXT,
    "quantity" TEXT,
    "servingSize" TEXT,
    "categories" JSONB,
    "categoryTags" JSONB,
    "ingredientsText" TEXT,
    "nutriments" JSONB,
    "nutriScore" TEXT,
    "novaGroup" INTEGER,
    "ecoScore" TEXT,
    "ecoScoreScore" DOUBLE PRECISION,
    "packagingTags" JSONB,
    "labelsTags" JSONB,
    "countriesTags" JSONB,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'OPEN_FOOD_FACTS',
    "sourceResponse" JSONB,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductScan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "foodProductId" TEXT,
    "productName" TEXT,
    "brand" TEXT,
    "imageUrl" TEXT,
    "scanSource" TEXT NOT NULL DEFAULT 'BARCODE',
    "scanContext" TEXT,
    "carbonEstimated" BOOLEAN NOT NULL DEFAULT false,
    "activityLogId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCarbonFactorMapping" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "appCategory" TEXT NOT NULL,
    "openFoodFactsTag" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "climatiqActivityId" TEXT,
    "climatiqFactorId" TEXT,
    "climatiqDataVersion" TEXT,
    "climatiqRegion" TEXT,
    "agribalyseId" TEXT,
    "manualCo2ePerKg" DOUBLE PRECISION,
    "unitType" TEXT NOT NULL DEFAULT 'Weight',
    "defaultWeightKg" DOUBLE PRECISION,
    "confidence" TEXT NOT NULL DEFAULT 'MEDIUM',
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodCarbonFactorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLookupCache" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OPEN_FOOD_FACTS',
    "endpoint" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "barcode" TEXT,
    "query" TEXT,
    "sourcePayload" JSONB,
    "sourceResponse" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductLookupCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodProduct_barcode_key" ON "FoodProduct"("barcode");

-- CreateIndex
CREATE INDEX "FoodProduct_barcode_idx" ON "FoodProduct"("barcode");

-- CreateIndex
CREATE INDEX "FoodProduct_source_idx" ON "FoodProduct"("source");

-- CreateIndex
CREATE INDEX "ProductScan_userId_idx" ON "ProductScan"("userId");

-- CreateIndex
CREATE INDEX "ProductScan_barcode_idx" ON "ProductScan"("barcode");

-- CreateIndex
CREATE INDEX "ProductScan_scanContext_idx" ON "ProductScan"("scanContext");

-- CreateIndex
CREATE INDEX "ProductScan_createdAt_idx" ON "ProductScan"("createdAt");

-- CreateIndex
CREATE INDEX "FoodCarbonFactorMapping_provider_idx" ON "FoodCarbonFactorMapping"("provider");

-- CreateIndex
CREATE INDEX "FoodCarbonFactorMapping_appCategory_idx" ON "FoodCarbonFactorMapping"("appCategory");

-- CreateIndex
CREATE INDEX "FoodCarbonFactorMapping_openFoodFactsTag_idx" ON "FoodCarbonFactorMapping"("openFoodFactsTag");

-- CreateIndex
CREATE INDEX "FoodCarbonFactorMapping_isActive_idx" ON "FoodCarbonFactorMapping"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLookupCache_cacheKey_key" ON "ProductLookupCache"("cacheKey");

-- CreateIndex
CREATE INDEX "ProductLookupCache_provider_idx" ON "ProductLookupCache"("provider");

-- CreateIndex
CREATE INDEX "ProductLookupCache_endpoint_idx" ON "ProductLookupCache"("endpoint");

-- CreateIndex
CREATE INDEX "ProductLookupCache_barcode_idx" ON "ProductLookupCache"("barcode");

-- CreateIndex
CREATE INDEX "ProductLookupCache_createdAt_idx" ON "ProductLookupCache"("createdAt");

-- CreateIndex
CREATE INDEX "ProductLookupCache_expiresAt_idx" ON "ProductLookupCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "ProductScan" ADD CONSTRAINT "ProductScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductScan" ADD CONSTRAINT "ProductScan_foodProductId_fkey" FOREIGN KEY ("foodProductId") REFERENCES "FoodProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
