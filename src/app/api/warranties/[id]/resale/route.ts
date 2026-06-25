import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { resaleTransferSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { initiateResaleTransfer } from "@/lib/warranty-service";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const warranty = await prisma.warranty.findUnique({ where: { id: params.id } });
    if (!warranty) return jsonError("Not found", 404);
    if (warranty.buyerId !== session.sub) return jsonError("Not your warranty", 403);

    const body = await req.json();
    const data = resaleTransferSchema.parse(body);

    const updated = await initiateResaleTransfer(params.id, session.sub, {
      newBuyerPhone: data.newBuyerPhone,
      newBuyerName: data.newBuyerName,
      resaleAmount: data.resaleAmount,
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const { cancelResaleTransfer } = await import("@/lib/warranty-service");
    const updated = await cancelResaleTransfer(params.id, session.sub);
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
