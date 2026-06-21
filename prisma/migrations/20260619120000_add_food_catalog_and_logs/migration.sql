CREATE TABLE "FoodCatalogItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dietType" TEXT,
    "servingSizeKg" DOUBLE PRECISION NOT NULL,
    "ingredients" JSONB NOT NULL,
    "totalCo2eKg" DOUBLE PRECISION NOT NULL,
    "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'MEDIUM',
    "dataSources" JSONB NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodCatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserFoodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "foodProductId" TEXT,
    "activityLogId" TEXT,
    "mode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "ingredients" JSONB NOT NULL,
    "totalCo2eKg" DOUBLE PRECISION NOT NULL,
    "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'MEDIUM',
    "dataSources" JSONB NOT NULL,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFoodLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FoodCatalogItem_slug_key" ON "FoodCatalogItem"("slug");
CREATE INDEX "FoodCatalogItem_name_idx" ON "FoodCatalogItem"("name");
CREATE INDEX "FoodCatalogItem_dietType_idx" ON "FoodCatalogItem"("dietType");
CREATE INDEX "FoodCatalogItem_isPopular_isActive_idx" ON "FoodCatalogItem"("isPopular", "isActive");
CREATE INDEX "UserFoodLog_userId_createdAt_idx" ON "UserFoodLog"("userId", "createdAt");
CREATE INDEX "UserFoodLog_catalogItemId_idx" ON "UserFoodLog"("catalogItemId");
CREATE INDEX "UserFoodLog_foodProductId_idx" ON "UserFoodLog"("foodProductId");
CREATE INDEX "UserFoodLog_activityLogId_idx" ON "UserFoodLog"("activityLogId");

ALTER TABLE "UserFoodLog" ADD CONSTRAINT "UserFoodLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFoodLog" ADD CONSTRAINT "UserFoodLog_catalogItemId_fkey"
FOREIGN KEY ("catalogItemId") REFERENCES "FoodCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserFoodLog" ADD CONSTRAINT "UserFoodLog_foodProductId_fkey"
FOREIGN KEY ("foodProductId") REFERENCES "FoodProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
