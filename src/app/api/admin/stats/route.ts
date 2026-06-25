import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { syncExpiredWarranties } from "@/lib/warranty-service";

export async function GET() {
  try {
    await syncExpiredWarranties();
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const [shops, warranties, claims, fraudFlags, chainRecords] = await Promise.all([
      prisma.shop.count(),
      prisma.warranty.count(),
      prisma.claim.count(),
      prisma.fraudFlag.count(),
      prisma.chainRecord.count(),
    ]);

    const active = await prisma.warranty.count({ where: { status: "ACTIVE" } });
    const expired = await prisma.warranty.count({ where: { status: "EXPIRED" } });
    const pending = await prisma.warranty.count({
      where: { status: "PENDING_TRANSFER" },
    });

    const recentFraud = await prisma.fraudFlag.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { shop: { select: { shopName: true } } },
    });

    return jsonOk({
      stats: { shops, warranties, claims, fraudFlags, chainRecords, active, expired, pending },
      recentFraud,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
