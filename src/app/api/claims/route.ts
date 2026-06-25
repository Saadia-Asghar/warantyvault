import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { claimOpenSchema, claimUpdateSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { openClaim } from "@/lib/warranty-service";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { notifyUser, resolveEmail } from "@/lib/notify";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const claims = await prisma.claim.findMany({
      where: {
        shopId: session.sub,
        status: { in: ["OPENED", "IN_REPAIR"] },
      },
      include: {
        warranty: {
          select: {
            id: true,
            productName: true,
            warrantyCode: true,
            warrantyHash: true,
            buyerName: true,
            buyerPhone: true,
          },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    return jsonOk(claims);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const data = claimOpenSchema.parse(body);
    const claim = await openClaim(session.sub, data.warrantyHash, data.issueDescription);
    return jsonOk(claim, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const { claimId, ...rest } = body;
    const data = claimUpdateSchema.parse(rest);

    if (!claimId) return jsonError("claimId required", 400);

    const claim = await prisma.claim.findFirst({
      where: { id: claimId, shopId: session.sub },
      include: { warranty: true },
    });

    if (!claim) return jsonError("Claim not found", 404);

    if (data.status === "REJECTED" && !data.rejectionReason) {
      return jsonError("Rejection reason required", 422);
    }

    const { txHash } = await recordAuditEvent({
      eventType: "CLAIM_UPDATE",
      actorId: session.sub,
      actorRole: "shop",
      entityType: "claim",
      entityId: claim.id,
      warrantyId: claim.warrantyId,
      warrantyHash: claim.warranty.warrantyHash,
      payload: { claimId: claim.id, status: data.status },
    });

    const updated = await prisma.claim.update({
      where: { id: claim.id },
      data: {
        status: data.status,
        rejectionReason: data.rejectionReason,
        chainTxClaim: txHash,
        closedAt: ["COMPLETED", "EXCHANGED", "REJECTED"].includes(data.status)
          ? new Date()
          : null,
      },
      include: { warranty: true },
    });

    if (updated.warranty.buyerId) {
      const buyerEmail = await resolveEmail("buyer", updated.warranty.buyerId);
      const statusLabel =
        data.status === "IN_REPAIR"
          ? "is now in repair"
          : data.status === "COMPLETED"
            ? "has been completed"
            : data.status === "EXCHANGED"
              ? "was exchanged"
              : data.status === "REJECTED"
                ? "was rejected"
                : "was updated";

      await notifyUser({
        userId: updated.warranty.buyerId,
        userRole: "buyer",
        title: "Claim status updated",
        body: `Your claim for ${updated.warranty.productName} ${statusLabel}.`,
        type: "CLAIM_UPDATED",
        linkUrl: `/buyer/warranty/${updated.warranty.id}`,
        email: buyerEmail,
      });
    }

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
