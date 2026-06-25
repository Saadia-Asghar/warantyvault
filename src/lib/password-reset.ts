import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

type ResetRole = "buyer" | "shop" | "company" | "admin";

async function findUserByEmail(role: ResetRole, email: string) {
  const normalized = email.toLowerCase();
  switch (role) {
    case "buyer":
      return prisma.buyer.findUnique({ where: { email: normalized } });
    case "shop":
      return prisma.shop.findUnique({ where: { email: normalized } });
    case "company":
      return prisma.company.findUnique({ where: { email: normalized } });
    case "admin":
      return prisma.admin.findUnique({ where: { email: normalized } });
  }
}

export async function requestPasswordReset(role: ResetRole, email: string) {
  const user = await findUserByEmail(role, email);
  if (!user) return { sent: false };

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userRole: role, userId: user.id, expiresAt },
  });

  await sendPasswordResetEmail(email.toLowerCase(), token);
  return { sent: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired reset link");
  }

  const passwordHash = await hashPassword(newPassword);

  switch (record.userRole as ResetRole) {
    case "buyer":
      await prisma.buyer.update({ where: { id: record.userId }, data: { passwordHash } });
      break;
    case "shop":
      await prisma.shop.update({ where: { id: record.userId }, data: { passwordHash } });
      break;
    case "company":
      await prisma.company.update({ where: { id: record.userId }, data: { passwordHash } });
      break;
    case "admin":
      await prisma.admin.update({ where: { id: record.userId }, data: { passwordHash } });
      break;
    default:
      throw new Error("Invalid reset token");
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
}
