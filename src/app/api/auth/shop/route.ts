import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { shopLoginSchema, shopRegisterSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { sendAdminAlert, sendWelcomeEmail } from "@/lib/email";
import { notifyUser } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "register") {
      const data = shopRegisterSchema.parse(body);
      const existing = await prisma.shop.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existing) return jsonError("Email already registered", 409);

      const shop = await prisma.shop.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: await hashPassword(data.password),
          shopName: data.shopName,
          ownerName: data.ownerName,
          phone: data.phone,
          city: data.city,
          sector: data.sector,
          address: data.address,
          category: data.category,
          companyId: data.joinNetwork && data.companyId ? data.companyId : null,
          approvalStatus:
            data.joinNetwork && data.companyId ? "PENDING" : "STANDALONE",
          policies: {
            create: [
              {
                name: "Mobile Standard",
                category: "MOBILE",
                policyType: "REPAIR_ONLY",
                durationMonths: 6,
                exclusions: "Water damage, physical damage, unauthorized repair",
                termsEn:
                  "6 months repair-only warranty. Manufacturing defects covered. Water and drop damage excluded.",
                termsUr:
                  "6 mahine ki repair warranty. Manufacturing fault cover hai. Pani aur girne ka nuksan shamil nahi.",
                isDefault: true,
              },
              {
                name: "Appliance Plus",
                category: "APPLIANCE",
                policyType: "REPAIR_PARTS",
                durationMonths: 12,
                exclusions: "Voltage fluctuation damage",
                termsEn:
                  "12 months repair with parts coverage for compressor/motor failure.",
                termsUr:
                  "12 mahine ki warranty parts ke sath. Compressor/motor ki kharabi cover hai.",
                isDefault: true,
              },
            ],
          },
        },
      });

      await sendWelcomeEmail(shop.email, shop.shopName, "Shop / Outlet");
      await sendAdminAlert("New shop registered", `${shop.shopName} — ${shop.email}`);

      if (shop.companyId) {
        const company = await prisma.company.findUnique({ where: { id: shop.companyId } });
        if (company) {
          await notifyUser({
            userId: company.id,
            userRole: "company",
            title: "New outlet application",
            body: `${shop.shopName} in ${shop.city} applied to join your dealer network.`,
            type: "OUTLET_PENDING",
            linkUrl: "/company",
            email: company.email,
          });
        }
      }

      const token = await createSession({
        sub: shop.id,
        role: "shop",
        name: shop.shopName,
        email: shop.email,
      });
      await setSessionCookie(token);
      return jsonOk({ id: shop.id, shopName: shop.shopName, email: shop.email });
    }

    if (action === "login") {
      const data = shopLoginSchema.parse(body);
      const shop = await prisma.shop.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (!shop || !(await verifyPassword(data.password, shop.passwordHash))) {
        return jsonError("Invalid email or password", 401);
      }

      const token = await createSession({
        sub: shop.id,
        role: "shop",
        name: shop.shopName,
        email: shop.email,
      });
      await setSessionCookie(token);
      return jsonOk({ id: shop.id, shopName: shop.shopName, email: shop.email });
    }

    return jsonError("Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
