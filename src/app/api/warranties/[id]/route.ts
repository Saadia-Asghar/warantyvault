import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { acceptWarrantyTransfer, syncExpiredWarranties } from "@/lib/warranty-service";
import { verifyOnChain } from "@/lib/blockchain";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await syncExpiredWarranties();
    const session = await getSession();
    const warranty = await prisma.warranty.findUnique({
      where: { id: params.id },
      include: {
        shop: true,
        buyer: true,
        company: { select: { brandName: true } },
        claims: { orderBy: { openedAt: "desc" } },
      },
    });

    if (!warranty) return jsonError("Not found", 404);

    const isShop = requireRole(session, "shop") && session.sub === warranty.shopId;
    const isBuyer =
      requireRole(session, "buyer") &&
      (warranty.buyerId === session.sub ||
        (warranty.status === "PENDING_TRANSFER" &&
          warranty.buyerPhone === session.phone));

    if (!isShop && !isBuyer && !requireRole(session, "admin")) {
      return jsonError("Unauthorized", 401);
    }

    const chain = await verifyOnChain(warranty.warrantyHash);
    return jsonOk({ warranty, chain });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const accepted = await acceptWarrantyTransfer(params.id, session.sub);
    return jsonOk(accepted);
  } catch (error) {
    return handleApiError(error);
  }
}
