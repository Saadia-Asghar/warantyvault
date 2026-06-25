import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/hash";

export type AuditEventType =
  | "WARRANTY_REGISTER"
  | "WARRANTY_TRANSFER"
  | "WARRANTY_REVOKE"
  | "CLAIM_OPEN"
  | "CLAIM_UPDATE"
  | "OUTLET_APPROVE"
  | "OUTLET_REJECT"
  | "OUTLET_SUSPEND"
  | "FRAUD_FLAG";

export async function recordAuditEvent(input: {
  eventType: AuditEventType;
  actorId?: string;
  actorRole?: string;
  entityType: string;
  entityId: string;
  warrantyId?: string;
  warrantyHash?: string;
  payload: Record<string, unknown>;
}): Promise<{ eventHash: string; txHash: string; auditEventId: string }> {
  const last = await prisma.auditEvent.findFirst({
    where: input.warrantyId ? { warrantyId: input.warrantyId } : undefined,
    orderBy: { createdAt: "desc" },
    select: { eventHash: true },
  });

  const payloadJson = JSON.stringify(input.payload);
  const prevEventHash = last?.eventHash ?? null;
  const eventHash = createHash("sha256")
    .update(
      [
        input.eventType,
        input.entityType,
        input.entityId,
        payloadJson,
        prevEventHash ?? "GENESIS",
        Date.now().toString(),
      ].join("|")
    )
    .digest("hex");

  const auditEvent = await prisma.auditEvent.create({
    data: {
      eventType: input.eventType,
      actorId: input.actorId,
      actorRole: input.actorRole,
      entityType: input.entityType,
      entityId: input.entityId,
      warrantyId: input.warrantyId,
      payloadJson,
      prevEventHash,
      eventHash,
    },
  });

  let txHash = eventHash;
  if (input.warrantyHash) {
    const txType =
      input.eventType === "WARRANTY_REGISTER"
        ? "REGISTER"
        : input.eventType === "WARRANTY_TRANSFER"
          ? "TRANSFER"
          : input.eventType === "WARRANTY_REVOKE"
            ? "REVOKE"
            : input.eventType.startsWith("CLAIM")
              ? "CLAIM"
              : "REGISTER";

    txHash = generateTxHash();
    await prisma.chainRecord.create({
      data: {
        warrantyHash: input.warrantyHash,
        txType,
        txHash,
        payload: payloadJson,
        auditEventId: auditEvent.id,
      },
    });
  }

  return { eventHash, txHash, auditEventId: auditEvent.id };
}

export async function getWarrantyAuditTimeline(warrantyId: string) {
  return prisma.auditEvent.findMany({
    where: { warrantyId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAdminAuditLog(limit = 100) {
  return prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
