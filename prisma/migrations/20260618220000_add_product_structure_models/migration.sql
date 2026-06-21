ALTER TABLE "Profile"
ADD COLUMN "mealFrequency" INTEGER,
ADD COLUMN "vehicleFuelType" TEXT,
ADD COLUMN "shoppingFrequency" TEXT,
ADD COLUMN "wasteHabits" TEXT,
ADD COLUMN "travelFrequency" TEXT,
ADD COLUMN "reductionGoal" TEXT,
ADD COLUMN "onboardingAnswers" JSONB;

ALTER TABLE "Budget"
ADD COLUMN "weeklyTargetKg" DOUBLE PRECISION,
ADD COLUMN "reductionPercentage" DOUBLE PRECISION,
ADD COLUMN "targetDate" TIMESTAMP(3),
ADD COLUMN "budgetType" TEXT;

CREATE TABLE "CarbonProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "monthlyFootprintKg" DOUBLE PRECISION NOT NULL,
  "yearlyFootprintKg" DOUBLE PRECISION NOT NULL,
  "mainImpactCategory" TEXT NOT NULL,
  "categoryBreakdown" JSONB NOT NULL,
  "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'MEDIUM',
  "dataSources" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CarbonProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CarbonProfile_userId_key" ON "CarbonProfile"("userId");
ALTER TABLE "CarbonProfile" ADD CONSTRAINT "CarbonProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ReceiptUpload" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "receiptType" TEXT NOT NULL,
  "filename" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REVIEWED',
  "extractedText" TEXT,
  "reviewedData" JSONB NOT NULL,
  "activityLogIds" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReceiptUpload_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReceiptUpload_userId_createdAt_idx" ON "ReceiptUpload"("userId", "createdAt");
ALTER TABLE "ReceiptUpload" ADD CONSTRAINT "ReceiptUpload_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "OwnedProduct" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "brand" TEXT,
  "estimatedFootprintKg" DOUBLE PRECISION NOT NULL,
  "purchaseDate" TIMESTAMP(3),
  "condition" TEXT,
  "usageFrequency" TEXT,
  "expectedLifetimeMonths" INTEGER,
  "notes" TEXT,
  "dataSource" TEXT NOT NULL DEFAULT 'Carbon Compass estimate',
  "confidence" "CarbonEstimateConfidence" NOT NULL DEFAULT 'LOW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OwnedProduct_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OwnedProduct_userId_createdAt_idx" ON "OwnedProduct"("userId", "createdAt");
ALTER TABLE "OwnedProduct" ADD CONSTRAINT "OwnedProduct_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WeeklyReview" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "weekEnd" TIMESTAMP(3) NOT NULL,
  "summary" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WeeklyReview_userId_weekStart_key" ON "WeeklyReview"("userId", "weekStart");
CREATE INDEX "WeeklyReview_userId_weekStart_idx" ON "WeeklyReview"("userId", "weekStart");
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
