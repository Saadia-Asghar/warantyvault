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
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    await syncExpiredWarranties();

    const sp = req.nextUrl.searchParams;
    const shopId = sp.get("shopId");

    const where = buildWarrantySearchWhere(
      {
        q: sp.get("q"),
        status: sp.get("status"),
        dateMonth: sp.get("dateMonth"),
        dateField: sp.get("dateField") as "issued" | "expires" | null,
      },
      {
        companyId: session.sub,
        ...(shopId ? { shopId } : {}),
      }
    );

    const warranties = await prisma.warranty.findMany({
      where,
      include: {
        ...WARRANTY_SEARCH_INCLUDE,
        claims: { orderBy: { openedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}
