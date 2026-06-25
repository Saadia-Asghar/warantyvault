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
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    await syncExpiredWarranties();

    const sp = req.nextUrl.searchParams;
    const q = sp.get("q");

    const where = buildWarrantySearchWhere(
      {
        q,
        status: sp.get("status"),
        dateMonth: sp.get("dateMonth"),
        dateField: sp.get("dateField") as "issued" | "expires" | null,
      },
      q || sp.get("status") || sp.get("dateMonth") ? {} : {}
    );

    const warranties = await prisma.warranty.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: WARRANTY_SEARCH_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}
