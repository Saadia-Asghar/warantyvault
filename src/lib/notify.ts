import {
  createNotification,
  type NotificationRole,
} from "@/lib/notifications";
import { sendAdminAlert, sendEventEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push-notifications";
import { prisma } from "@/lib/prisma";

export async function notifyUser(input: {
  userId: string;
  userRole: NotificationRole;
  title: string;
  body: string;
  type: string;
  linkUrl?: string;
  email?: string | null;
}) {
  await createNotification({
    userId: input.userId,
    userRole: input.userRole,
    title: input.title,
    body: input.body,
    type: input.type,
    linkUrl: input.linkUrl,
  });

  if (input.email) {
    await sendEventEmail(input.email, input.title, input.body, input.linkUrl);
  }

  await sendPushToUser({
    userId: input.userId,
    userRole: input.userRole,
    title: input.title,
    body: input.body,
    linkUrl: input.linkUrl,
  });

  await sendAdminAlert(input.type, `${input.title} — ${input.body}`);
}

export async function notifyBuyerByPhoneWithEmail(
  phone: string,
  notification: {
    title: string;
    body: string;
    type: string;
    linkUrl?: string;
  }
) {
  const buyer = await prisma.buyer.findUnique({ where: { phone } });
  if (!buyer) return null;

  await notifyUser({
    userId: buyer.id,
    userRole: "buyer",
    email: buyer.email,
    ...notification,
  });

  return buyer;
}

export async function resolveEmail(
  userRole: NotificationRole | "admin",
  userId: string
): Promise<string | null> {
  if (userRole === "buyer") {
    const u = await prisma.buyer.findUnique({ where: { id: userId } });
    return u?.email ?? null;
  }
  if (userRole === "shop") {
    const u = await prisma.shop.findUnique({ where: { id: userId } });
    return u?.email ?? null;
  }
  if (userRole === "company") {
    const u = await prisma.company.findUnique({ where: { id: userId } });
    return u?.email ?? null;
  }
  if (userRole === "admin") {
    const u = await prisma.admin.findUnique({ where: { id: userId } });
    return u?.email ?? null;
  }
  return null;
}
