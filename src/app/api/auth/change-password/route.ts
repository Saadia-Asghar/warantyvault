import { NextRequest } from "next/server";
import {
  getSession,
  hashPassword,
  verifyPassword,
  type SessionRole,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

async function updatePassword(role: SessionRole, userId: string, newHash: string) {
  if (role === "buyer") {
    return prisma.buyer.update({ where: { id: userId }, data: { passwordHash: newHash } });
  }
  if (role === "shop") {
    return prisma.shop.update({ where: { id: userId }, data: { passwordHash: newHash } });
  }
  if (role === "company") {
    return prisma.company.update({ where: { id: userId }, data: { passwordHash: newHash } });
  }
  if (role === "admin") {
    return prisma.admin.update({ where: { id: userId }, data: { passwordHash: newHash } });
  }
  throw new Error("Invalid role");
}

async function getPasswordHash(role: SessionRole, userId: string): Promise<string | null> {
  if (role === "buyer") {
    const u = await prisma.buyer.findUnique({ where: { id: userId } });
    return u?.passwordHash ?? null;
  }
  if (role === "shop") {
    const u = await prisma.shop.findUnique({ where: { id: userId } });
    return u?.passwordHash ?? null;
  }
  if (role === "company") {
    const u = await prisma.company.findUnique({ where: { id: userId } });
    return u?.passwordHash ?? null;
  }
  if (role === "admin") {
    const u = await prisma.admin.findUnique({ where: { id: userId } });
    return u?.passwordHash ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const data = changePasswordSchema.parse(await req.json());
    const currentHash = await getPasswordHash(session.role, session.sub);
    if (!currentHash) return jsonError("User not found", 404);

    const valid = await verifyPassword(data.currentPassword, currentHash);
    if (!valid) return jsonError("Current password is incorrect", 401);

    const newHash = await hashPassword(data.newPassword);
    await updatePassword(session.role, session.sub, newHash);
    return jsonOk({ message: "Password updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
