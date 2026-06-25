import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
