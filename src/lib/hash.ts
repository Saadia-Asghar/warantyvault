import { createHash, randomBytes } from "crypto";

export type WarrantyHashPayload = {
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
  purchaseAmount?: number | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paperPhotoHash?: string | null;
};

function amountSegment(amount: number | null | undefined): string {
  return (amount ?? 0).toFixed(2);
}

/** v2 — warranty terms only (pre–sale record) */
export function computeWarrantyHashV2(payload: Omit<WarrantyHashPayload, "purchaseAmount" | "paymentMethod" | "paymentReference" | "paperPhotoHash">): string {
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

/** v3 — full sale + warranty record (amount, payment, paper photo hash) */
export function computeWarrantyHash(payload: WarrantyHashPayload): string {
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
    amountSegment(payload.purchaseAmount),
    payload.paymentMethod ?? "",
    payload.paymentReference ?? "",
    payload.paperPhotoHash ?? "",
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
  purchaseAmount?: number | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paperPhotoHash?: string | null;
}): { v3: string; v2: string; legacy: string } {
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
    warrantyCode: warranty.warrantyCode,
    termsEn: warranty.termsEn,
  };
  return {
    v3: computeWarrantyHash({
      ...base,
      purchaseAmount: warranty.purchaseAmount,
      paymentMethod: warranty.paymentMethod,
      paymentReference: warranty.paymentReference,
      paperPhotoHash: warranty.paperPhotoHash,
    }),
    v2: computeWarrantyHashV2(base),
    legacy: computeWarrantyHashLegacy({
      companyId: base.companyId,
      shopId: base.shopId,
      serialImei: base.serialImei,
      buyerPhone: base.buyerPhone,
      productName: base.productName,
      startUnix,
      endUnix,
      policyType: base.policyType,
    }),
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
  purchaseAmount?: number | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paperPhotoHash?: string | null;
}): boolean {
  const { v3, v2, legacy } = recomputeWarrantyHashFromRow(warranty);
  return (
    warranty.warrantyHash === v3 ||
    warranty.warrantyHash === v2 ||
    warranty.warrantyHash === legacy
  );
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
