import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { stockReceiveSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const [pending, inventory, inStock] = await Promise.all([
      prisma.stockDispatch.findMany({
        where: { shopId: session.sub, status: "PENDING" },
        include: { items: true, company: { select: { brandName: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockItem.findMany({
        where: { shopId: session.sub, status: "IN_STOCK" },
        orderBy: { receivedAt: "desc" },
      }),
      prisma.stockItem.count({ where: { shopId: session.sub, status: "IN_STOCK" } }),
    ]);

    return jsonOk({ pending, inventory, inStock });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const { dispatchId } = stockReceiveSchema.parse(body);

    const dispatch = await prisma.stockDispatch.findFirst({
      where: { id: dispatchId, shopId: session.sub, status: "PENDING" },
    });
    if (!dispatch) return jsonError("Dispatch not found or already received", 404);

    const updated = await prisma.$transaction(async (tx) => {
      const d = await tx.stockDispatch.update({
        where: { id: dispatchId },
        data: { status: "RECEIVED", receivedAt: new Date() },
        include: { items: true, company: { select: { brandName: true } } },
      });
      await tx.stockItem.updateMany({
        where: { dispatchId },
        data: { status: "IN_STOCK" },
      });
      return d;
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
