import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const { warrantyId, reminderType, action } = await req.json();
    if (!warrantyId || !reminderType) return jsonError("warrantyId and reminderType required", 400);

    const type = action === "dismiss" ? `DISMISSED_${reminderType}` : reminderType;

    await prisma.reminderLog.create({
      data: { warrantyId, reminderType: type },
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
