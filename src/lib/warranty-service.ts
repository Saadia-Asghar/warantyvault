import { prisma } from "@/lib/prisma";
import {
  computeWarrantyHash,
  generateClaimHash,
  generateWarrantyCode,
  validateWarrantyHash,
} from "@/lib/hash";
import { recordAuditEvent } from "@/lib/audit";
import { notifyBuyerByPhoneWithEmail, notifyUser, resolveEmail } from "@/lib/notify";
import { sendSms, warrantyIssuedSms } from "@/lib/sms";

const REGISTERED_STATUSES = ["PENDING_TRANSFER", "ACTIVE", "EXPIRED", "REVOKED"];

export async function checkDuplicateSerial(
  serialImei: string | null | undefined,
  excludeWarrantyId?: string
): Promise<boolean> {
  if (!serialImei?.trim()) return false;

  const existing = await prisma.warranty.findFirst({
    where: {
      serialImei: serialImei.trim(),
      status: { in: ["PENDING_TRANSFER", "ACTIVE"] },
      ...(excludeWarrantyId ? { NOT: { id: excludeWarrantyId } } : {}),
    },
  });

  return !!existing;
}

export async function queuePendingBuyerAlert(buyerPhone: string, warrantyId: string) {
  await prisma.pendingWarrantyAlert.create({
    data: { buyerPhone, warrantyId },
  });
}

export async function deliverPendingAlerts(buyerId: string, buyerPhone: string) {
  const pending = await prisma.pendingWarrantyAlert.findMany({
    where: { buyerPhone, delivered: false },
  });
  for (const alert of pending) {
    const warranty = await prisma.warranty.findUnique({
      where: { id: alert.warrantyId },
      include: { shop: true },
    });
    if (warranty) {
      await notifyUser({
        userId: buyerId,
        userRole: "buyer",
        title: "New warranty waiting for you",
        body: `${warranty.shop.shopName} issued a warranty for ${warranty.productName}. Open your wallet and tap Accept.`,
        type: "WARRANTY_ISSUED",
        linkUrl: "/buyer",
        email: (await prisma.buyer.findUnique({ where: { id: buyerId } }))?.email,
      });
    }
    await prisma.pendingWarrantyAlert.update({
      where: { id: alert.id },
      data: { delivered: true },
    });
  }
}

export async function registerWarranty(warrantyId: string, shopId: string) {
  const warranty = await prisma.warranty.findFirst({
    where: { id: warrantyId, shopId },
  });

  if (!warranty) throw new Error("Warranty not found");
  if (warranty.status !== "DRAFT") throw new Error("Warranty already registered");

  if (warranty.serialImei) {
    const duplicate = await checkDuplicateSerial(warranty.serialImei, warranty.id);
    if (duplicate) {
      await prisma.fraudFlag.create({
        data: {
          shopId,
          serialImei: warranty.serialImei,
          reason: "Duplicate active serial at registration",
        },
      });
      throw new Error("This serial/IMEI already has an active warranty");
    }
  }

  const startUnix = Math.floor(warranty.startDate.getTime() / 1000);
  const endUnix = Math.floor(warranty.endDate.getTime() / 1000);

  const warrantyHash = computeWarrantyHash({
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
  });

  const { txHash } = await recordAuditEvent({
    eventType: "WARRANTY_REGISTER",
    actorId: shopId,
    actorRole: "shop",
    entityType: "warranty",
    entityId: warrantyId,
    warrantyId,
    warrantyHash,
    payload: {
      warrantyCode: warranty.warrantyCode,
      companyId: warranty.companyId,
      shopId,
      expiresAt: endUnix,
      policyType: warranty.policyType,
    },
  });

  const updated = await prisma.warranty.update({
    where: { id: warrantyId },
    data: {
      warrantyHash,
      chainTxRegister: txHash,
      status: "PENDING_TRANSFER",
      registeredAt: new Date(),
    },
    include: { shop: true },
  });

  if (updated.buyerPhone) {
    const notified = await notifyBuyerByPhoneWithEmail(updated.buyerPhone, {
      title: "New warranty waiting for you",
      body: `${updated.shop.shopName} issued a warranty for ${updated.productName}. Open your wallet and tap Accept.`,
      type: "WARRANTY_ISSUED",
      linkUrl: "/buyer",
    });
    if (!notified) {
      await queuePendingBuyerAlert(updated.buyerPhone, updated.id);
    }
    await sendSms(
      updated.buyerPhone,
      warrantyIssuedSms(updated.shop.shopName, updated.productName)
    );
  }

  return updated;
}

export async function acceptWarrantyTransfer(warrantyId: string, buyerId: string) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
    include: { buyer: true },
  });

  if (!warranty) throw new Error("Warranty not found");
  if (warranty.status !== "PENDING_TRANSFER") {
    throw new Error("Warranty is not pending transfer");
  }

  const buyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
  if (!buyer) throw new Error("Buyer not found");

  if (warranty.buyerPhone && warranty.buyerPhone !== buyer.phone) {
    throw new Error("This warranty was issued to a different phone number");
  }

  const { txHash } = await recordAuditEvent({
    eventType: "WARRANTY_TRANSFER",
    actorId: buyerId,
    actorRole: "buyer",
    entityType: "warranty",
    entityId: warrantyId,
    warrantyId,
    warrantyHash: warranty.warrantyHash,
    payload: { buyerId, buyerPhone: buyer.phone },
  });

  const now = new Date();
  const status = warranty.endDate < now ? "EXPIRED" : "ACTIVE";

  const result = await prisma.warranty.update({
    where: { id: warrantyId },
    data: {
      buyerId,
      chainTxTransfer: txHash,
      status,
    },
    include: { shop: true, buyer: true },
  });

  const shopEmail = await resolveEmail("shop", result.shopId);
  await notifyUser({
    userId: result.shopId,
    userRole: "shop",
    title: "Warranty accepted",
    body: `${result.buyer?.name ?? buyer.phone} accepted warranty ${result.warrantyCode} for ${result.productName}.`,
    type: "WARRANTY_ACCEPTED",
    linkUrl: "/shop",
    email: shopEmail,
  });

  return result;
}

export async function revokeWarranty(
  warrantyId: string,
  actorId: string,
  actorRole: "company" | "admin",
  reason?: string
) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
    include: { buyer: true },
  });
  if (!warranty) throw new Error("Warranty not found");
  if (warranty.status === "REVOKED") throw new Error("Already revoked");

  const revokeReason = reason?.trim() || "Revoked by authorized party";

  const { txHash } = await recordAuditEvent({
    eventType: "WARRANTY_REVOKE",
    actorId,
    actorRole,
    entityType: "warranty",
    entityId: warrantyId,
    warrantyId,
    warrantyHash: warranty.warrantyHash,
    payload: { reason: revokeReason },
  });

  const updated = await prisma.warranty.update({
    where: { id: warrantyId },
    data: { status: "REVOKED", chainTxTransfer: warranty.chainTxTransfer ?? txHash },
  });

  if (warranty.buyerId) {
    const buyerEmail = await resolveEmail("buyer", warranty.buyerId);
    await notifyUser({
      userId: warranty.buyerId,
      userRole: "buyer",
      title: "Warranty revoked",
      body: `Your warranty for ${warranty.productName} was revoked. Reason: ${revokeReason}`,
      type: "WARRANTY_REVOKED",
      linkUrl: `/buyer/warranty/${warrantyId}`,
      email: buyerEmail,
    });
  }

  return updated;
}

export async function verifyWarrantyHash(hash: string) {
  const warranty = await prisma.warranty.findUnique({
    where: { warrantyHash: hash },
    include: {
      shop: { select: { shopName: true, city: true, sector: true, phone: true } },
      company: { select: { brandName: true, legalName: true } },
      claims: {
        orderBy: { openedAt: "desc" },
        take: 5,
        include: { shop: { select: { shopName: true, city: true, sector: true } } },
      },
    },
  });

  if (!warranty || !REGISTERED_STATUSES.includes(warranty.status)) {
    return { valid: false, expired: false, revoked: false, tampered: false, warranty: null };
  }

  const tampered = !validateWarrantyHash(warranty);
  if (tampered) {
    return { valid: false, expired: false, revoked: false, tampered: true, warranty };
  }

  if (warranty.status === "REVOKED") {
    return { valid: false, expired: false, revoked: true, tampered: false, warranty };
  }

  const now = new Date();
  const expired = warranty.endDate < now;

  if (expired && warranty.status === "ACTIVE") {
    await prisma.warranty.update({
      where: { id: warranty.id },
      data: { status: "EXPIRED" },
    });
  }

  return {
    valid: !expired && warranty.status !== "EXPIRED",
    expired,
    revoked: false,
    tampered: false,
    warranty: { ...warranty, status: expired ? "EXPIRED" : warranty.status },
  };
}

/** Any APPROVED outlet in the same company network can process claims */
export async function canShopProcessClaim(
  claimingShopId: string,
  warranty: { shopId: string; companyId: string | null }
): Promise<{ allowed: boolean; reason?: string }> {
  const claimingShop = await prisma.shop.findUnique({
    where: { id: claimingShopId },
    select: { companyId: true, approvalStatus: true, shopName: true, city: true, sector: true },
  });

  if (!claimingShop) return { allowed: false, reason: "Shop not found" };
  if (claimingShop.approvalStatus === "SUSPENDED") {
    return { allowed: false, reason: "Your outlet has been suspended" };
  }

  if (claimingShopId === warranty.shopId) return { allowed: true };

  if (
    warranty.companyId &&
    claimingShop.companyId === warranty.companyId &&
    claimingShop.approvalStatus === "APPROVED"
  ) {
    return { allowed: true };
  }

  if (!warranty.companyId) {
    return {
      allowed: false,
      reason: "Standalone shop warranty — claim only at the issuing outlet",
    };
  }

  if (claimingShop.approvalStatus !== "APPROVED") {
    return { allowed: false, reason: "Your outlet is not approved by the brand yet" };
  }

  return {
    allowed: false,
    reason: "This warranty belongs to a different brand network",
  };
}

export async function openClaim(
  shopId: string,
  warrantyHash: string,
  issueDescription: string
) {
  const verification = await verifyWarrantyHash(warrantyHash);
  if (!verification.warranty) throw new Error("Warranty not found");
  if (verification.tampered) throw new Error("Warranty data integrity check failed");

  const access = await canShopProcessClaim(shopId, {
    shopId: verification.warranty.shopId,
    companyId: verification.warranty.companyId,
  });

  if (!access.allowed) {
    throw new Error(access.reason ?? "You cannot process this warranty claim");
  }

  if (!verification.valid) {
    throw new Error(verification.expired ? "Warranty has expired" : "Warranty is not valid");
  }

  const existing = await prisma.claim.findFirst({
    where: {
      warrantyId: verification.warranty.id,
      status: { in: ["OPENED", "IN_REPAIR"] },
    },
  });

  if (existing) throw new Error("An open claim already exists for this warranty");

  const claimHash = generateClaimHash(warrantyHash, Date.now());

  const claim = await prisma.claim.create({
    data: {
      warrantyId: verification.warranty.id,
      shopId,
      issueDescription,
      claimHash,
      status: "OPENED",
    },
    include: { warranty: { include: { shop: true } } },
  });

  const { txHash } = await recordAuditEvent({
    eventType: "CLAIM_OPEN",
    actorId: shopId,
    actorRole: "shop",
    entityType: "claim",
    entityId: claim.id,
    warrantyId: verification.warranty.id,
    warrantyHash,
    payload: { claimHash, status: "OPENED", claimId: claim.id },
  });

  await prisma.claim.update({
    where: { id: claim.id },
    data: { chainTxClaim: txHash },
  });

  if (verification.warranty.buyerId) {
    const buyerEmail = await resolveEmail("buyer", verification.warranty.buyerId);
    await notifyUser({
      userId: verification.warranty.buyerId,
      userRole: "buyer",
      title: "Claim opened on your warranty",
      body: `${claim.warranty.shop.shopName} is processing a claim for ${verification.warranty.productName}.`,
      type: "CLAIM_OPENED",
      linkUrl: `/buyer/warranty/${verification.warranty.id}`,
      email: buyerEmail,
    });
  }

  return claim;
}

export async function syncExpiredWarranties() {
  await prisma.warranty.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}

export { generateWarrantyCode };
