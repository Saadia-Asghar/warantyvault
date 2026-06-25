import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revokeWarranty } from "@/lib/warranty-service";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    if (session.role !== "admin" && session.role !== "company") {
      return jsonError("Forbidden", 403);
    }

    const warranty = await prisma.warranty.findUnique({ where: { id: params.id } });
    if (!warranty) return jsonError("Not found", 404);

    if (session.role === "company" && warranty.companyId !== session.sub) {
      return jsonError("Forbidden", 403);
    }

    const { reason } = await req.json().catch(() => ({}));
    const updated = await revokeWarranty(
      params.id,
      session.sub,
      session.role as "company" | "admin",
      typeof reason === "string" ? reason : undefined
    );
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
