-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityCategory" ADD VALUE 'PRODUCT';
ALTER TYPE "ActivityCategory" ADD VALUE 'MATERIAL';

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "sourceActivityId" TEXT,
ADD COLUMN     "sourceDataset" TEXT,
ADD COLUMN     "sourceFactorId" TEXT,
ADD COLUMN     "sourceRegion" TEXT,
ADD COLUMN     "sourceYear" INTEGER;

-- CreateTable
CREATE TABLE "EmissionFactorMapping" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'CLIMATIQ',
    "appCategory" TEXT NOT NULL,
    "appActivityType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "climatiqFactorId" TEXT,
    "climatiqActivityId" TEXT,
    "climatiqDataVersion" TEXT NOT NULL,
    "climatiqRegion" TEXT,
    "climatiqYear" INTEGER,
    "climatiqSource" TEXT,
    "climatiqDataset" TEXT,
    "unitType" TEXT,
    "defaultParameters" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmissionFactorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmissionFactorMapping_provider_idx" ON "EmissionFactorMapping"("provider");

-- CreateIndex
CREATE INDEX "EmissionFactorMapping_appCategory_idx" ON "EmissionFactorMapping"("appCategory");

-- CreateIndex
CREATE INDEX "EmissionFactorMapping_appActivityType_idx" ON "EmissionFactorMapping"("appActivityType");

-- CreateIndex
CREATE INDEX "EmissionFactorMapping_isActive_idx" ON "EmissionFactorMapping"("isActive");

-- CreateIndex
CREATE INDEX "ActivityLog_sourceFactorId_idx" ON "ActivityLog"("sourceFactorId");

-- CreateIndex
CREATE INDEX "ActivityLog_sourceActivityId_idx" ON "ActivityLog"("sourceActivityId");
