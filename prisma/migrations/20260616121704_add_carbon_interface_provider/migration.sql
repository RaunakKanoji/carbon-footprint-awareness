-- AlterEnum
ALTER TYPE "CalculationProvider" ADD VALUE 'CARBON_INTERFACE';

-- CreateIndex
CREATE INDEX "ActivityLog_provider_idx" ON "ActivityLog"("provider");
