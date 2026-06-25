import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const outlets = await prisma.shop.findMany({
      where: { companyId: session.sub },
      select: { id: true, shopName: true, city: true, approvalStatus: true },
    });

    const outletIds = outlets.map((o) => o.id);

    const [warranties, claims, fraudFlags] = await Promise.all([
      prisma.warranty.count({
        where: { companyId: session.sub, status: { not: "DRAFT" } },
      }),
      prisma.claim.count({
        where: { warranty: { companyId: session.sub } },
      }),
      prisma.fraudFlag.count({
        where: { shopId: { in: outletIds } },
      }),
    ]);

    const byOutlet = await Promise.all(
      outlets.map(async (o) => ({
        ...o,
        warranties: await prisma.warranty.count({
          where: { shopId: o.id, status: { not: "DRAFT" } },
        }),
        openClaims: await prisma.claim.count({
          where: {
            shopId: o.id,
            status: { in: ["OPENED", "IN_REPAIR"] },
          },
        }),
      }))
    );

    return jsonOk({
      kpis: {
        outlets: outlets.length,
        approved: outlets.filter((o) => o.approvalStatus === "APPROVED").length,
        warranties,
        claims,
        fraudFlags,
      },
      byOutlet,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
