import { daysUntil } from "@/lib/utils";

type ClaimLike = { status: string };
type WarrantyLike = {
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  claims?: ClaimLike[];
};

export type WarrantyBucket =
  | "pending"
  | "available"
  | "in_claim"
  | "used"
  | "expired"
  | "revoked";

export type ReminderKind = "HALFWAY" | "EXPIRING_30" | "EXPIRING_7" | "EXPIRED";

export type WarrantyReminder = {
  warrantyId: string;
  productName: string;
  kind: ReminderKind;
  message: string;
  daysRemaining: number;
};

const FULFILLED_CLAIM = ["COMPLETED", "EXCHANGED"];
const OPEN_CLAIM = ["OPENED", "IN_REPAIR"];

export function latestClaim(claims?: ClaimLike[]) {
  return claims?.[0];
}

export function getWarrantyBucket(w: WarrantyLike): WarrantyBucket {
  if (w.status === "PENDING_TRANSFER" || w.status === "PENDING_RESALE") return "pending";
  if (w.status === "REVOKED") return "revoked";
  if (w.status === "EXPIRED") return "expired";

  const claim = latestClaim(w.claims);
  if (claim && FULFILLED_CLAIM.includes(claim.status)) return "used";
  if (claim && OPEN_CLAIM.includes(claim.status)) return "in_claim";
  if (w.status === "ACTIVE" && daysUntil(w.endDate) <= 0) return "expired";
  if (w.status === "ACTIVE") return "available";

  return "expired";
}

export function bucketLabel(bucket: WarrantyBucket): string {
  const map: Record<WarrantyBucket, string> = {
    pending: "Pending acceptance",
    available: "Active & available",
    in_claim: "Claim in progress",
    used: "Used / fulfilled",
    expired: "Expired",
    revoked: "Revoked",
  };
  return map[bucket];
}

function totalWarrantyDays(w: WarrantyLike): number {
  const start = new Date(w.startDate).getTime();
  const end = new Date(w.endDate).getTime();
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function buildReminders(
  warranties: Array<WarrantyLike & { id: string; productName: string }>
): WarrantyReminder[] {
  const reminders: WarrantyReminder[] = [];

  for (const w of warranties) {
    const bucket = getWarrantyBucket(w);
    if (bucket !== "available" && bucket !== "in_claim") continue;

    const days = daysUntil(w.endDate);
    const total = totalWarrantyDays(w);
    const halfPoint = Math.floor(total / 2);

    if (days <= 0) {
      reminders.push({
        warrantyId: w.id,
        productName: w.productName,
        kind: "EXPIRED",
        message: `${w.productName} warranty has expired`,
        daysRemaining: days,
      });
    } else if (days <= 7) {
      reminders.push({
        warrantyId: w.id,
        productName: w.productName,
        kind: "EXPIRING_7",
        message: `${w.productName} expires in ${days} day(s)`,
        daysRemaining: days,
      });
    } else if (days <= 30) {
      reminders.push({
        warrantyId: w.id,
        productName: w.productName,
        kind: "EXPIRING_30",
        message: `${w.productName} expires in ${days} days`,
        daysRemaining: days,
      });
    } else if (days <= halfPoint) {
      reminders.push({
        warrantyId: w.id,
        productName: w.productName,
        kind: "HALFWAY",
        message: `${w.productName} is past half its warranty period (${days} days left)`,
        daysRemaining: days,
      });
    }
  }

  const priority: Record<ReminderKind, number> = {
    EXPIRED: 0,
    EXPIRING_7: 1,
    EXPIRING_30: 2,
    HALFWAY: 3,
  };

  return reminders.sort(
    (a, b) => priority[a.kind] - priority[b.kind] || a.daysRemaining - b.daysRemaining
  );
}
