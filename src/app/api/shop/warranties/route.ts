import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import {
  buildWarrantySearchWhere,
  WARRANTY_SEARCH_INCLUDE,
} from "@/lib/warranty-search";
import { syncExpiredWarranties } from "@/lib/warranty-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    await syncExpiredWarranties();

    const sp = req.nextUrl.searchParams;
    const q = sp.get("q");
    const status = sp.get("status");
    const dateMonth = sp.get("dateMonth");
    const dateField = sp.get("dateField") as "issued" | "expires" | null;

    const where = buildWarrantySearchWhere(
      { q, status, dateMonth, dateField },
      { shopId: session.sub }
    );

    const warranties = await prisma.warranty.findMany({
      where,
      include: WARRANTY_SEARCH_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}
