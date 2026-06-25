import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";
import { daysUntil } from "@/lib/utils";
import {
  buildReminders,
  getWarrantyBucket,
  type WarrantyBucket,
} from "@/lib/warranty-buckets";

export type BuyerWalletData = {
  warranties: Array<{
    id: string;
    productName: string;
    warrantyCode: string;
    status: string;
    startDate: Date;
    endDate: Date;
    daysRemaining: number;
    bucket: WarrantyBucket;
    purchaseSector: string | null;
    shop: { shopName: string; city: string; phone: string };
    brandName: string | null;
    claims: Array<{
      id: string;
      status: string;
      openedAt: Date;
    }>;
  }>;
  buckets: Record<WarrantyBucket, BuyerWalletData["warranties"]>;
  reminders: ReturnType<typeof buildReminders>;
  summary: {
    totalPurchases: number;
    activeWarranties: number;
    pendingAccept: number;
    totalSpent: number;
  };
};

export async function getBuyerWalletData(session: SessionPayload): Promise<BuyerWalletData> {
  const warranties = await prisma.warranty.findMany({
    where: {
      OR: [
        { buyerId: session.sub },
        {
          status: "PENDING_TRANSFER",
          buyerPhone: session.phone ?? "",
        },
        {
          status: "PENDING_RESALE",
          resaleToPhone: session.phone ?? "",
        },
      ],
    },
    include: {
      shop: { select: { shopName: true, city: true, phone: true } },
      company: { select: { brandName: true } },
      claims: { orderBy: { openedAt: "desc" }, take: 1 },
    },
    orderBy: { endDate: "asc" },
  });

  const enriched = warranties.map((w) => {
    const daysRemaining = daysUntil(w.endDate);
    const bucket = getWarrantyBucket(w);
    return {
      id: w.id,
      productName: w.productName,
      warrantyCode: w.warrantyCode,
      status: w.status,
      startDate: w.startDate,
      endDate: w.endDate,
      daysRemaining,
      bucket,
      purchaseSector: w.purchaseSector,
      shop: w.shop,
      brandName: w.company?.brandName ?? null,
      claims: w.claims,
    };
  });

  const buckets = enriched.reduce(
    (acc, w) => {
      acc[w.bucket].push(w);
      return acc;
    },
    {
      pending: [],
      available: [],
      in_claim: [],
      used: [],
      expired: [],
      revoked: [],
    } as Record<WarrantyBucket, typeof enriched>
  );

  const reminders = buildReminders(
    warranties.map((w) => ({
      id: w.id,
      productName: w.productName,
      status: w.status,
      startDate: w.startDate,
      endDate: w.endDate,
      claims: w.claims,
    }))
  );

  const dismissed = await prisma.reminderLog.findMany({
    where: {
      warrantyId: { in: warranties.map((w) => w.id) },
      reminderType: { startsWith: "DISMISSED_" },
    },
  });
  const dismissedKeys = new Set(
    dismissed.map((d) => `${d.warrantyId}:${d.reminderType.replace("DISMISSED_", "")}`)
  );
  const activeReminders = reminders.filter(
    (r) => !dismissedKeys.has(`${r.warrantyId}:${r.kind}`)
  );

  const owned = warranties.filter(
    (w) => w.buyerId === session.sub && w.status !== "PENDING_TRANSFER"
  );
  const summary = {
    totalPurchases: owned.length,
    activeWarranties: owned.filter((w) => w.status === "ACTIVE").length,
    pendingAccept: warranties.filter(
      (w) =>
        w.status === "PENDING_TRANSFER" ||
        (w.status === "PENDING_RESALE" && w.resaleToPhone === session.phone)
    ).length,
    totalSpent: owned.reduce((sum, w) => sum + (w.purchaseAmount ?? 0), 0),
  };

  return { warranties: enriched, buckets, reminders: activeReminders, summary };
}

export function buyerWalletFingerprint(data: BuyerWalletData): string {
  return JSON.stringify({
    ids: data.warranties.map((w) => `${w.id}:${w.status}:${w.bucket}`),
    pending: data.summary.pendingAccept,
    reminders: data.reminders.length,
    spent: data.summary.totalSpent,
  });
}
