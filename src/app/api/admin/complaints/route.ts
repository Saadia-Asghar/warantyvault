import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk(complaints);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const { id, status } = await req.json();
    if (!id || !status) return jsonError("id and status required", 400);

    const updated = await prisma.complaint.update({
      where: { id },
      data: { status },
    });
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
