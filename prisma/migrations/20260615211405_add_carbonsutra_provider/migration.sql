-- CreateEnum
CREATE TYPE "CalculationProvider" AS ENUM ('CARBONSUTRA', 'MANUAL', 'OPEN_FOOD_FACTS', 'CLIMATIQ');

-- CreateEnum
CREATE TYPE "CarbonEstimateConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityCategory" ADD VALUE 'ELECTRICITY';
ALTER TYPE "ActivityCategory" ADD VALUE 'FLIGHT';
ALTER TYPE "ActivityCategory" ADD VALUE 'FUEL';
ALTER TYPE "ActivityCategory" ADD VALUE 'HOTEL';
ALTER TYPE "ActivityCategory" ADD VALUE 'SHIPPING';
ALTER TYPE "ActivityCategory" ADD VALUE 'RECYCLING';

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "activityType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "calculationMethod" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "distanceUnit" TEXT,
ADD COLUMN     "distanceValue" DOUBLE PRECISION,
ADD COLUMN     "energyUnit" TEXT,
ADD COLUMN     "energyValue" DOUBLE PRECISION,
ADD COLUMN     "moneyUnit" TEXT,
ADD COLUMN     "moneyValue" DOUBLE PRECISION,
ADD COLUMN     "provider" "CalculationProvider" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "quantityUnit" TEXT,
ADD COLUMN     "quantityValue" DOUBLE PRECISION,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "sourceEndpoint" TEXT,
ADD COLUMN     "sourcePayload" JSONB,
ADD COLUMN     "sourceResponse" JSONB,
ADD COLUMN     "weightUnit" TEXT,
ADD COLUMN     "weightValue" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CarbonEstimateCache" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "co2eKg" DOUBLE PRECISION NOT NULL,
    "sourcePayload" JSONB NOT NULL,
    "sourceResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarbonEstimateCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarbonEstimateCache_cacheKey_key" ON "CarbonEstimateCache"("cacheKey");

-- CreateIndex
CREATE INDEX "CarbonEstimateCache_provider_idx" ON "CarbonEstimateCache"("provider");

-- CreateIndex
CREATE INDEX "CarbonEstimateCache_endpoint_idx" ON "CarbonEstimateCache"("endpoint");

-- CreateIndex
CREATE INDEX "CarbonEstimateCache_createdAt_idx" ON "CarbonEstimateCache"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
