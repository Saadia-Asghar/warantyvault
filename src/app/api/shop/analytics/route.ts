import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const warranties = await prisma.warranty.findMany({
      where: {
        shopId: session.sub,
        status: { in: ["ACTIVE", "PENDING_TRANSFER", "EXPIRED"] },
      },
      select: {
        productName: true,
        category: true,
        purchaseAmount: true,
        status: true,
        createdAt: true,
      },
    });

    const byProduct = new Map<
      string,
      { productName: string; category: string; sold: number; active: number; revenue: number }
    >();

    let totalRevenue = 0;
    let activeWarranties = 0;

    for (const w of warranties) {
      const key = w.productName;
      const row = byProduct.get(key) ?? {
        productName: w.productName,
        category: w.category,
        sold: 0,
        active: 0,
        revenue: 0,
      };
      row.sold += 1;
      if (w.status === "ACTIVE" || w.status === "PENDING_TRANSFER") {
        row.active += 1;
        activeWarranties += 1;
      }
      if (w.purchaseAmount) {
        row.revenue += w.purchaseAmount;
        totalRevenue += w.purchaseAmount;
      }
      byProduct.set(key, row);
    }

    const inStock = await prisma.stockItem.count({
      where: { shopId: session.sub, status: "IN_STOCK" },
    });

    return jsonOk({
      totalSales: warranties.length,
      activeWarranties,
      totalRevenue,
      inStock,
      byProduct: Array.from(byProduct.values()).sort((a, b) => b.sold - a.sold),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
