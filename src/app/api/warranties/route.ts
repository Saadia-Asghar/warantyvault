import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { issueWarrantySchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import {
  checkDuplicateSerial,
  generateWarrantyCode,
  registerWarranty,
} from "@/lib/warranty-service";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const warranties = await prisma.warranty.findMany({
      where: { shopId: session.sub },
      include: {
        buyer: { select: { name: true, phone: true } },
        claims: { orderBy: { openedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(warranties);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const shop = await prisma.shop.findUnique({ where: { id: session.sub } });
    if (!shop) return jsonError("Shop not found", 404);

    if (shop.approvalStatus === "PENDING") {
      return jsonError(
        "Your outlet is pending brand approval. You cannot issue network warranties yet.",
        403
      );
    }

    if (shop.approvalStatus === "REJECTED") {
      return jsonError("Your outlet application was rejected by the brand.", 403);
    }

    const body = await req.json();
    const data = issueWarrantySchema.parse(body);

    if (data.serialImei) {
      const duplicate = await checkDuplicateSerial(data.serialImei);
      if (duplicate) {
        await prisma.fraudFlag.create({
          data: {
            shopId: session.sub,
            serialImei: data.serialImei,
            reason: "Duplicate serial at issue attempt",
          },
        });
        return jsonError("Serial/IMEI already has an active warranty", 409);
      }
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.durationMonths);

    const warranty = await prisma.warranty.create({
      data: {
        warrantyCode: generateWarrantyCode(),
        companyId: shop.companyId,
        shopId: session.sub,
        productName: data.productName,
        category: data.category,
        serialImei: data.serialImei?.trim() || null,
        purchaseAmount: data.purchaseAmount,
        policyType: data.policyType,
        durationMonths: data.durationMonths,
        exclusions: data.exclusions ?? "",
        termsEn: data.termsEn,
        termsUr: data.termsUr,
        startDate,
        endDate,
        buyerPhone: data.buyerPhone,
        buyerName: data.buyerName,
        purchaseCity: shop.city,
        purchaseSector: shop.sector,
        warrantyHash: "pending",
        status: "DRAFT",
      },
    });

    const registered = await registerWarranty(warranty.id, session.sub);
    return jsonOk(registered, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
