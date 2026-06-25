-- Add shop coordinates for nearby search
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Distinguish simulated vs Polygon Amoy transactions
ALTER TABLE "ChainRecord" ADD COLUMN IF NOT EXISTS "network" TEXT NOT NULL DEFAULT 'local';
