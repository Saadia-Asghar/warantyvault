import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const claims = await prisma.claim.findMany({
      where: {
        warranty: { companyId: session.sub },
        status: { in: ["OPENED", "IN_REPAIR"] },
      },
      include: {
        warranty: {
          select: {
            id: true,
            productName: true,
            warrantyCode: true,
            buyerName: true,
            buyerPhone: true,
          },
        },
        shop: { select: { shopName: true, city: true, sector: true } },
      },
      orderBy: { openedAt: "desc" },
      take: 100,
    });

    return jsonOk(claims);
  } catch (error) {
    return handleApiError(error);
  }
}
