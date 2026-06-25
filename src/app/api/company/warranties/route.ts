import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const status = req.nextUrl.searchParams.get("status");
    const shopId = req.nextUrl.searchParams.get("shopId");
    const q = req.nextUrl.searchParams.get("q");

    const warranties = await prisma.warranty.findMany({
      where: {
        companyId: session.sub,
        ...(status ? { status } : {}),
        ...(shopId ? { shopId } : {}),
        ...(q
          ? {
              OR: [
                { productName: { contains: q, mode: "insensitive" } },
                { warrantyCode: { contains: q, mode: "insensitive" } },
                { buyerPhone: { contains: q } },
                { serialImei: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        shop: { select: { shopName: true, city: true, sector: true } },
        buyer: { select: { name: true, phone: true } },
        claims: { orderBy: { openedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}
