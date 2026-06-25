import { createHash, randomBytes } from "crypto";

export function computeWarrantyHash(payload: {
  companyId: string;
  shopId: string;
  serialImei: string;
  buyerPhone: string;
  productName: string;
  startUnix: number;
  endUnix: number;
  policyType: string;
  warrantyCode: string;
  termsEn: string;
}): string {
  const raw = [
    payload.companyId || "STANDALONE",
    payload.shopId,
    payload.serialImei || "NO_SERIAL",
    payload.buyerPhone,
    payload.productName,
    payload.startUnix.toString(),
    payload.endUnix.toString(),
    payload.policyType,
    payload.warrantyCode,
    payload.termsEn,
  ].join("|");

  return createHash("sha256").update(raw).digest("hex");
}

/** Legacy hash (pre-v2) for existing rows until re-seeded */
export function computeWarrantyHashLegacy(payload: {
  companyId: string;
  shopId: string;
  serialImei: string;
  buyerPhone: string;
  productName: string;
  startUnix: number;
  endUnix: number;
  policyType: string;
}): string {
  const raw = [
    payload.companyId || "STANDALONE",
    payload.shopId,
    payload.serialImei || "NO_SERIAL",
    payload.buyerPhone,
    payload.productName,
    payload.startUnix.toString(),
    payload.endUnix.toString(),
    payload.policyType,
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

export function recomputeWarrantyHashFromRow(warranty: {
  companyId: string | null;
  shopId: string;
  serialImei: string | null;
  buyerPhone: string | null;
  productName: string;
  startDate: Date;
  endDate: Date;
  policyType: string;
  warrantyCode: string;
  termsEn: string;
}): { v2: string; legacy: string } {
  const startUnix = Math.floor(warranty.startDate.getTime() / 1000);
  const endUnix = Math.floor(warranty.endDate.getTime() / 1000);
  const base = {
    companyId: warranty.companyId ?? "STANDALONE",
    shopId: warranty.shopId,
    serialImei: warranty.serialImei ?? "",
    buyerPhone: warranty.buyerPhone ?? "",
    productName: warranty.productName,
    startUnix,
    endUnix,
    policyType: warranty.policyType,
  };
  return {
    v2: computeWarrantyHash({
      ...base,
      warrantyCode: warranty.warrantyCode,
      termsEn: warranty.termsEn,
    }),
    legacy: computeWarrantyHashLegacy(base),
  };
}

export function validateWarrantyHash(warranty: {
  warrantyHash: string;
  companyId: string | null;
  shopId: string;
  serialImei: string | null;
  buyerPhone: string | null;
  productName: string;
  startDate: Date;
  endDate: Date;
  policyType: string;
  warrantyCode: string;
  termsEn: string;
}): boolean {
  const { v2, legacy } = recomputeWarrantyHashFromRow(warranty);
  return warranty.warrantyHash === v2 || warranty.warrantyHash === legacy;
}

export function generateTxHash(): string {
  return `0x${randomBytes(32).toString("hex")}`;
}

export function generateClaimHash(warrantyHash: string, timestamp: number): string {
  return createHash("sha256")
    .update(`${warrantyHash}|claim|${timestamp}`)
    .digest("hex");
}

export function generateWarrantyCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `WV-PK-${new Date().getFullYear()}-${num}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return "****";
  return `${phone.slice(0, 4)}****${phone.slice(-2)}`;
}
