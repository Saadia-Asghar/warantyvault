import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = adminLoginSchema.parse(body);

    const admin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!admin || !(await verifyPassword(data.password, admin.passwordHash))) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await createSession({
      sub: admin.id,
      role: "admin",
      name: "Admin",
      email: admin.email,
    });
    await setSessionCookie(token);
    return jsonOk({ email: admin.email });
  } catch (error) {
    return handleApiError(error);
  }
}
