-- CreateTable
CREATE TABLE "SavedPlace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedRoute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "originLabel" TEXT,
    "destinationLabel" TEXT,
    "originAddress" TEXT,
    "destinationAddress" TEXT,
    "originLat" DOUBLE PRECISION NOT NULL,
    "originLng" DOUBLE PRECISION NOT NULL,
    "destinationLat" DOUBLE PRECISION NOT NULL,
    "destinationLng" DOUBLE PRECISION NOT NULL,
    "profile" TEXT NOT NULL,
    "distanceMeters" DOUBLE PRECISION,
    "distanceKm" DOUBLE PRECISION,
    "durationSeconds" DOUBLE PRECISION,
    "durationMinutes" DOUBLE PRECISION,
    "carbonLogged" BOOLEAN NOT NULL DEFAULT false,
    "activityLogId" TEXT,
    "rawImport" JSONB,
    "routePayload" JSONB,
    "routeResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteEstimateCache" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OPENROUTESERVICE',
    "endpoint" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "distanceMeters" DOUBLE PRECISION,
    "distanceKm" DOUBLE PRECISION,
    "durationSeconds" DOUBLE PRECISION,
    "durationMinutes" DOUBLE PRECISION,
    "sourcePayload" JSONB NOT NULL,
    "sourceResponse" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteEstimateCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedPlace_userId_idx" ON "SavedPlace"("userId");

-- CreateIndex
CREATE INDEX "SavedPlace_source_idx" ON "SavedPlace"("source");

-- CreateIndex
CREATE INDEX "ImportedRoute_userId_idx" ON "ImportedRoute"("userId");

-- CreateIndex
CREATE INDEX "ImportedRoute_source_idx" ON "ImportedRoute"("source");

-- CreateIndex
CREATE INDEX "ImportedRoute_profile_idx" ON "ImportedRoute"("profile");

-- CreateIndex
CREATE INDEX "ImportedRoute_createdAt_idx" ON "ImportedRoute"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RouteEstimateCache_cacheKey_key" ON "RouteEstimateCache"("cacheKey");

-- CreateIndex
CREATE INDEX "RouteEstimateCache_provider_idx" ON "RouteEstimateCache"("provider");

-- CreateIndex
CREATE INDEX "RouteEstimateCache_endpoint_idx" ON "RouteEstimateCache"("endpoint");

-- CreateIndex
CREATE INDEX "RouteEstimateCache_createdAt_idx" ON "RouteEstimateCache"("createdAt");

-- CreateIndex
CREATE INDEX "RouteEstimateCache_expiresAt_idx" ON "RouteEstimateCache"("expiresAt");

-- AddForeignKey
ALTER TABLE "SavedPlace" ADD CONSTRAINT "SavedPlace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedRoute" ADD CONSTRAINT "ImportedRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
