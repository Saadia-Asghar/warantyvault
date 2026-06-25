import type { SessionPayload } from "@/lib/auth";

type WarrantyAccess = {
  shopId: string;
  buyerId: string | null;
  companyId: string | null;
  buyerPhone: string | null;
  status: string;
};

export function canAccessWarranty(
  session: SessionPayload | null,
  warranty: WarrantyAccess
): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  if (session.role === "shop" && session.sub === warranty.shopId) return true;
  if (session.role === "company" && warranty.companyId === session.sub) return true;
  if (session.role === "buyer") {
    if (warranty.buyerId === session.sub) return true;
    if (
      warranty.status === "PENDING_TRANSFER" &&
      warranty.buyerPhone &&
      session.phone === warranty.buyerPhone
    ) {
      return true;
    }
  }
  return false;
}
