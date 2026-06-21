-- CreateTable
CREATE TABLE "AgribalyseFoodFactor" (
    "id" TEXT NOT NULL,
    "agribalyseId" TEXT,
    "ciqualCode" TEXT,
    "foodCode" TEXT,
    "name" TEXT NOT NULL,
    "nameFr" TEXT,
    "nameEn" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "groupName" TEXT,
    "climateChangeKgCo2ePerKg" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "source" TEXT NOT NULL DEFAULT 'AGRIBALYSE',
    "version" TEXT,
    "rawRow" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgribalyseFoodFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodFactorMapping" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'AGRIBALYSE',
    "appCategory" TEXT NOT NULL,
    "appActivityType" TEXT,
    "openFoodFactsTag" TEXT,
    "openFoodFactsCategory" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "agribalyseFoodFactorId" TEXT,
    "agribalyseName" TEXT,
    "agribalyseCode" TEXT,
    "defaultQuantityKg" DOUBLE PRECISION,
    "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'MEDIUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodFactorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgribalyseImportJob" (
    "id" TEXT NOT NULL,
    "filename" TEXT,
    "version" TEXT,
    "source" TEXT NOT NULL DEFAULT 'AGRIBALYSE',
    "status" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "columnMapping" JSONB,
    "previewRows" JSONB,
    "errorLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgribalyseImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgribalyseFoodFactor_agribalyseId_idx" ON "AgribalyseFoodFactor"("agribalyseId");
CREATE INDEX "AgribalyseFoodFactor_ciqualCode_idx" ON "AgribalyseFoodFactor"("ciqualCode");
CREATE INDEX "AgribalyseFoodFactor_foodCode_idx" ON "AgribalyseFoodFactor"("foodCode");
CREATE INDEX "AgribalyseFoodFactor_name_idx" ON "AgribalyseFoodFactor"("name");
CREATE INDEX "AgribalyseFoodFactor_category_idx" ON "AgribalyseFoodFactor"("category");
CREATE INDEX "AgribalyseFoodFactor_subCategory_idx" ON "AgribalyseFoodFactor"("subCategory");
CREATE INDEX "AgribalyseFoodFactor_source_idx" ON "AgribalyseFoodFactor"("source");
CREATE INDEX "AgribalyseFoodFactor_version_idx" ON "AgribalyseFoodFactor"("version");
CREATE INDEX "AgribalyseFoodFactor_isActive_idx" ON "AgribalyseFoodFactor"("isActive");
CREATE INDEX "FoodFactorMapping_provider_idx" ON "FoodFactorMapping"("provider");
CREATE INDEX "FoodFactorMapping_appCategory_idx" ON "FoodFactorMapping"("appCategory");
CREATE INDEX "FoodFactorMapping_appActivityType_idx" ON "FoodFactorMapping"("appActivityType");
CREATE INDEX "FoodFactorMapping_openFoodFactsTag_idx" ON "FoodFactorMapping"("openFoodFactsTag");
CREATE INDEX "FoodFactorMapping_agribalyseFoodFactorId_idx" ON "FoodFactorMapping"("agribalyseFoodFactorId");
CREATE INDEX "FoodFactorMapping_isActive_idx" ON "FoodFactorMapping"("isActive");
CREATE INDEX "AgribalyseImportJob_status_idx" ON "AgribalyseImportJob"("status");
CREATE INDEX "AgribalyseImportJob_version_idx" ON "AgribalyseImportJob"("version");
CREATE INDEX "AgribalyseImportJob_createdAt_idx" ON "AgribalyseImportJob"("createdAt");

-- AddForeignKey
ALTER TABLE "FoodFactorMapping" ADD CONSTRAINT "FoodFactorMapping_agribalyseFoodFactorId_fkey" FOREIGN KEY ("agribalyseFoodFactorId") REFERENCES "AgribalyseFoodFactor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
