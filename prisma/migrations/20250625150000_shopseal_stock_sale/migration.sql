-- Sale record fields on warranty
ALTER TABLE "Warranty" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Warranty" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "Warranty" ADD COLUMN IF NOT EXISTS "paperPhotoHash" TEXT;

-- Stock dispatch & inventory
CREATE TABLE IF NOT EXISTS "StockDispatch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3),

    CONSTRAINT "StockDispatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockItem" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT,
    "companyId" TEXT,
    "shopId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serialImei" TEXT,
    "sku" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "warrantyId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StockItem_warrantyId_key" ON "StockItem"("warrantyId");
CREATE INDEX IF NOT EXISTS "StockItem_shopId_status_idx" ON "StockItem"("shopId", "status");
CREATE INDEX IF NOT EXISTS "StockItem_companyId_idx" ON "StockItem"("companyId");
CREATE INDEX IF NOT EXISTS "StockDispatch_companyId_idx" ON "StockDispatch"("companyId");
CREATE INDEX IF NOT EXISTS "StockDispatch_shopId_status_idx" ON "StockDispatch"("shopId", "status");

ALTER TABLE "StockDispatch" DROP CONSTRAINT IF EXISTS "StockDispatch_companyId_fkey";
ALTER TABLE "StockDispatch" ADD CONSTRAINT "StockDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockDispatch" DROP CONSTRAINT IF EXISTS "StockDispatch_shopId_fkey";
ALTER TABLE "StockDispatch" ADD CONSTRAINT "StockDispatch_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockItem" DROP CONSTRAINT IF EXISTS "StockItem_dispatchId_fkey";
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "StockDispatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockItem" DROP CONSTRAINT IF EXISTS "StockItem_shopId_fkey";
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockItem" DROP CONSTRAINT IF EXISTS "StockItem_warrantyId_fkey";
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_warrantyId_fkey" FOREIGN KEY ("warrantyId") REFERENCES "Warranty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
