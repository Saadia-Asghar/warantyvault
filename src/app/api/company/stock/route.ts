import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { stockDispatchSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const [dispatches, inventory] = await Promise.all([
      prisma.stockDispatch.findMany({
        where: { companyId: session.sub },
        include: {
          shop: { select: { shopName: true, city: true, sector: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.stockItem.groupBy({
        by: ["status"],
        where: { companyId: session.sub },
        _count: { _all: true },
      }),
    ]);

    const stockStats = {
      inStock: inventory.find((r) => r.status === "IN_STOCK")?._count._all ?? 0,
      sold: inventory.find((r) => r.status === "SOLD")?._count._all ?? 0,
    };

    return jsonOk({ dispatches, stockStats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const data = stockDispatchSchema.parse(body);

    const shop = await prisma.shop.findFirst({
      where: { id: data.shopId, companyId: session.sub, approvalStatus: "APPROVED" },
    });
    if (!shop) return jsonError("Outlet not found or not approved", 404);

    const dispatch = await prisma.stockDispatch.create({
      data: {
        companyId: session.sub,
        shopId: data.shopId,
        reference: data.reference?.trim() || null,
        items: {
          create: data.items.map((item) => ({
            companyId: session.sub,
            shopId: data.shopId,
            productName: item.productName,
            category: item.category,
            serialImei: item.serialImei?.trim() || null,
            sku: item.sku?.trim() || null,
            status: "IN_TRANSIT",
          })),
        },
      },
      include: { items: true, shop: { select: { shopName: true, city: true } } },
    });

    return jsonOk(dispatch, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
