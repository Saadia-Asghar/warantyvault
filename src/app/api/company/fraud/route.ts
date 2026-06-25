import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const outletIds = (
      await prisma.shop.findMany({
        where: { companyId: session.sub },
        select: { id: true },
      })
    ).map((s) => s.id);

    const flags = await prisma.fraudFlag.findMany({
      where: { shopId: { in: outletIds } },
      include: { shop: { select: { shopName: true, city: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return jsonOk(flags);
  } catch (error) {
    return handleApiError(error);
  }
}
