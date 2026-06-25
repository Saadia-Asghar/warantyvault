import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") ?? "";

    const warranties = await prisma.warranty.findMany({
      where: q
        ? {
            OR: [
              { warrantyCode: { contains: q, mode: "insensitive" } },
              { productName: { contains: q, mode: "insensitive" } },
              { buyerPhone: { contains: q } },
              { warrantyHash: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        shop: { select: { shopName: true } },
        company: { select: { brandName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}
