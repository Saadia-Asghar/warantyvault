import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { policyTemplateSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const shop = await prisma.shop.findUnique({
      where: { id: session.sub },
      select: { companyId: true, approvalStatus: true },
    });

    const shopPolicies = await prisma.policyTemplate.findMany({
      where: { shopId: session.sub },
      orderBy: { createdAt: "asc" },
    });

    let companyPolicies: Awaited<ReturnType<typeof prisma.companyPolicyTemplate.findMany>> = [];
    if (shop?.companyId && shop.approvalStatus === "APPROVED") {
      companyPolicies = await prisma.companyPolicyTemplate.findMany({
        where: { companyId: shop.companyId },
        orderBy: { createdAt: "asc" },
      });
    }

    return jsonOk({ shopPolicies, companyPolicies });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const data = policyTemplateSchema.parse(await req.json());
    const policy = await prisma.policyTemplate.create({
      data: { ...data, shopId: session.sub },
    });
    return jsonOk(policy, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const { id, ...rest } = await req.json();
    if (!id) return jsonError("id required", 400);

    const existing = await prisma.policyTemplate.findFirst({
      where: { id, shopId: session.sub },
    });
    if (!existing) return jsonError("Not found", 404);

    const data = policyTemplateSchema.partial().parse(rest);
    const updated = await prisma.policyTemplate.update({
      where: { id },
      data,
    });
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "shop")) return jsonError("Unauthorized", 401);

    const { id } = await req.json();
    if (!id) return jsonError("id required", 400);

    const existing = await prisma.policyTemplate.findFirst({
      where: { id, shopId: session.sub },
    });
    if (!existing) return jsonError("Not found", 404);

    await prisma.policyTemplate.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
