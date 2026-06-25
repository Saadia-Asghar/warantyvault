import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { policyTemplateSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const policies = await prisma.companyPolicyTemplate.findMany({
      where: { companyId: session.sub },
      orderBy: { createdAt: "asc" },
    });
    return jsonOk(policies);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const data = policyTemplateSchema.parse(await req.json());
    const policy = await prisma.companyPolicyTemplate.create({
      data: { ...data, companyId: session.sub },
    });
    return jsonOk(policy, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "company")) return jsonError("Unauthorized", 401);

    const { id, ...rest } = await req.json();
    if (!id) return jsonError("id required", 400);

    const existing = await prisma.companyPolicyTemplate.findFirst({
      where: { id, companyId: session.sub },
    });
    if (!existing) return jsonError("Not found", 404);

    const data = policyTemplateSchema.partial().parse(rest);
    const updated = await prisma.companyPolicyTemplate.update({
      where: { id },
      data,
    });
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
