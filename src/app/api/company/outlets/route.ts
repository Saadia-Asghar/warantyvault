import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { notifyUser } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const status = req.nextUrl.searchParams.get("status");
    const city = req.nextUrl.searchParams.get("city");

    const outlets = await prisma.shop.findMany({
      where: {
        companyId: session.sub,
        ...(status ? { approvalStatus: status } : {}),
        ...(city ? { city: { contains: city } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: outlets.length,
      approved: outlets.filter((o) => o.approvalStatus === "APPROVED").length,
      pending: outlets.filter((o) => o.approvalStatus === "PENDING").length,
      suspended: outlets.filter((o) => o.approvalStatus === "SUSPENDED").length,
    };

    return jsonOk({ outlets, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const { outletId, action } = await req.json();
    if (!outletId || !["approve", "reject", "suspend", "reinstate"].includes(action)) {
      return jsonError("Invalid request", 400);
    }

    const outlet = await prisma.shop.findFirst({
      where: { id: outletId, companyId: session.sub },
    });
    if (!outlet) return jsonError("Outlet not found", 404);

    const cityCode = outlet.city.slice(0, 3).toUpperCase();
    const sectorCode = (outlet.sector ?? "MAIN").replace(/\s/g, "").toUpperCase();
    const count = await prisma.shop.count({
      where: { companyId: session.sub, approvalStatus: "APPROVED" },
    });

    const statusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      suspend: "SUSPENDED",
      reinstate: "APPROVED",
    } as const;

    const updated = await prisma.shop.update({
      where: { id: outletId },
      data: {
        approvalStatus: statusMap[action as keyof typeof statusMap],
        outletCode:
          action === "approve"
            ? outlet.outletCode ?? `${cityCode}-${sectorCode}-${String(count + 1).padStart(3, "0")}`
            : outlet.outletCode,
      },
    });

    const eventType =
      action === "approve"
        ? "OUTLET_APPROVE"
        : action === "reject"
          ? "OUTLET_REJECT"
          : action === "suspend"
            ? "OUTLET_SUSPEND"
            : "OUTLET_APPROVE";

    await recordAuditEvent({
      eventType,
      actorId: session.sub,
      actorRole: "company",
      entityType: "shop",
      entityId: outletId,
      payload: { shopName: updated.shopName, action },
    });

    const titles = {
      approve: "Outlet approved",
      reject: "Outlet application rejected",
      suspend: "Outlet suspended",
      reinstate: "Outlet reinstated",
    };
    const bodies = {
      approve: `Your outlet ${updated.shopName} is now approved on the brand network.`,
      reject: `Your outlet application for ${updated.shopName} was not approved.`,
      suspend: `Your outlet ${updated.shopName} has been suspended by the brand.`,
      reinstate: `Your outlet ${updated.shopName} has been reinstated on the brand network.`,
    };

    await notifyUser({
      userId: updated.id,
      userRole: "shop",
      title: titles[action as keyof typeof titles],
      body: bodies[action as keyof typeof bodies],
      type: eventType,
      linkUrl: "/shop",
      email: updated.email,
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
