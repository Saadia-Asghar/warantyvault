import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { companyLoginSchema, companyRegisterSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { sendAdminAlert, sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "register") {
      const data = companyRegisterSchema.parse(body);
      const existing = await prisma.company.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existing) return jsonError("Email already registered", 409);

      const company = await prisma.company.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: await hashPassword(data.password),
          legalName: data.legalName,
          brandName: data.brandName,
          phone: data.phone,
          ntn: data.ntn,
          policies: {
            create: [
              {
                name: "Network Standard",
                category: "MOBILE",
                policyType: "REPAIR_ONLY",
                durationMonths: 6,
                exclusions: "Water damage, physical damage",
                termsEn:
                  "Valid at any approved outlet nationwide. 6 months repair for manufacturing defects.",
                termsUr:
                  "Pakistan bhar ke kisi bhi approved outlet par valid. 6 mahine repair warranty.",
                isDefault: true,
              },
            ],
          },
        },
      });

      await sendWelcomeEmail(company.email, company.brandName, "Company / Brand");
      await sendAdminAlert("New company registered", `${company.brandName} — ${company.email}`);

      const token = await createSession({
        sub: company.id,
        role: "company",
        name: company.brandName,
        email: company.email,
      });
      await setSessionCookie(token);
      return jsonOk({ id: company.id, brandName: company.brandName });
    }

    if (action === "login") {
      const data = companyLoginSchema.parse(body);
      const company = await prisma.company.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (!company || !(await verifyPassword(data.password, company.passwordHash))) {
        return jsonError("Invalid email or password", 401);
      }

      const token = await createSession({
        sub: company.id,
        role: "company",
        name: company.brandName,
        email: company.email,
      });
      await setSessionCookie(token);
      return jsonOk({ id: company.id, brandName: company.brandName });
    }

    return jsonError("Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
