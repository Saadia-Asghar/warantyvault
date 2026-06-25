import { getSession } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) {
      return Response.json({ success: false, error: "Buyer login required" }, { status: 401 });
    }

    const fromWarranties = await prisma.warranty.findMany({
      where: { buyerId: session.sub },
      select: {
        id: true,
        warrantyCode: true,
        productName: true,
        shop: { select: { id: true, shopName: true, city: true, approvalStatus: true } },
      },
      distinct: ["shopId"],
    });

    const warrantyShops = fromWarranties
      .filter((w) => w.shop.approvalStatus === "APPROVED")
      .map((w) => ({
        id: w.shop.id,
        shopName: w.shop.shopName,
        city: w.shop.city,
        warrantyId: w.id,
        warrantyCode: w.warrantyCode,
        productName: w.productName,
      }));

    const allApproved = await prisma.shop.findMany({
      where: { approvalStatus: "APPROVED" },
      select: { id: true, shopName: true, city: true },
      orderBy: { shopName: "asc" },
      take: 100,
    });

    const seen = new Set(warrantyShops.map((s) => s.id));
    const more = allApproved
      .filter((s) => !seen.has(s.id))
      .map((s) => ({ ...s, warrantyId: undefined, warrantyCode: undefined, productName: undefined }));

    return jsonOk({ shops: [...warrantyShops, ...more] });
  } catch (error) {
    return handleApiError(error);
  }
}
