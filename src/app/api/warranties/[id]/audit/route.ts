import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWarrantyAuditTimeline } from "@/lib/audit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const warranty = await prisma.warranty.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        buyerId: true,
        shopId: true,
        companyId: true,
      },
    });
    if (!warranty) return jsonError("Not found", 404);

    const allowed =
      (session.role === "buyer" && warranty.buyerId === session.sub) ||
      (session.role === "shop" && warranty.shopId === session.sub) ||
      (session.role === "company" && warranty.companyId === session.sub) ||
      session.role === "admin";

    if (!allowed) return jsonError("Forbidden", 403);

    const events = await getWarrantyAuditTimeline(params.id);
    const warrantyFull = await prisma.warranty.findUnique({
      where: { id: params.id },
      select: { warrantyHash: true },
    });
    const chainRecords = warrantyFull
      ? await prisma.chainRecord.findMany({
          where: { warrantyHash: warrantyFull.warrantyHash },
          orderBy: { createdAt: "asc" },
        })
      : [];

    return jsonOk({ events, chain: chainRecords });
  } catch (error) {
    return handleApiError(error);
  }
}
