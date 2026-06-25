-- Wallet linking (SIWE) for buyers and shops
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "walletLinkedAt" TIMESTAMP(3);
ALTER TABLE "Buyer" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;
ALTER TABLE "Buyer" ADD COLUMN IF NOT EXISTS "walletLinkedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Shop_walletAddress_key" ON "Shop"("walletAddress");
CREATE UNIQUE INDEX IF NOT EXISTS "Buyer_walletAddress_key" ON "Buyer"("walletAddress");

CREATE TABLE IF NOT EXISTS "WalletNonce" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletNonce_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WalletNonce_nonce_key" ON "WalletNonce"("nonce");
CREATE INDEX IF NOT EXISTS "WalletNonce_userId_userRole_purpose_idx" ON "WalletNonce"("userId", "userRole", "purpose");
