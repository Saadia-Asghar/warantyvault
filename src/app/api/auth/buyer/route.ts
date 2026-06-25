import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { buyerLoginSchema, buyerRegisterSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { sendAdminAlert, sendWelcomeEmail } from "@/lib/email";
import { deliverPendingAlerts } from "@/lib/warranty-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "register") {
      const data = buyerRegisterSchema.parse(body);
      const existing = await prisma.buyer.findUnique({
        where: { phone: data.phone },
      });
      if (existing) return jsonError("Phone already registered", 409);

      if (data.email) {
        const emailTaken = await prisma.buyer.findUnique({
          where: { email: data.email.toLowerCase() },
        });
        if (emailTaken) return jsonError("Email already registered", 409);
      }

      const buyer = await prisma.buyer.create({
        data: {
          phone: data.phone,
          email: data.email.toLowerCase(),
          passwordHash: await hashPassword(data.password),
          name: data.name,
        },
      });

      await sendWelcomeEmail(buyer.email!, buyer.name, "Buyer");
      await sendAdminAlert("New buyer registered", `${buyer.name} — ${buyer.phone}`);
      await deliverPendingAlerts(buyer.id, buyer.phone);

      const token = await createSession({
        sub: buyer.id,
        role: "buyer",
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email ?? undefined,
      });
      await setSessionCookie(token);
      return jsonOk({ id: buyer.id, name: buyer.name, phone: buyer.phone });
    }

    if (action === "login") {
      const data = buyerLoginSchema.parse(body);
      const buyer = await prisma.buyer.findUnique({ where: { phone: data.phone } });
      if (!buyer || !(await verifyPassword(data.password, buyer.passwordHash))) {
        return jsonError("Invalid phone or password", 401);
      }

      await deliverPendingAlerts(buyer.id, buyer.phone);

      const token = await createSession({
        sub: buyer.id,
        role: "buyer",
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email ?? undefined,
      });
      await setSessionCookie(token);
      return jsonOk({ id: buyer.id, name: buyer.name, phone: buyer.phone });
    }

    return jsonError("Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
