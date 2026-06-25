import { prisma } from "@/lib/prisma";

export type NotificationRole = "shop" | "buyer" | "company";

export async function createNotification(input: {
  userId: string;
  userRole: NotificationRole;
  title: string;
  body: string;
  type: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({ data: input });
}

export async function notifyBuyerByPhone(
  phone: string,
  notification: Omit<Parameters<typeof createNotification>[0], "userId" | "userRole">
) {
  const buyer = await prisma.buyer.findUnique({ where: { phone } });
  if (!buyer) return null;
  return createNotification({
    userId: buyer.id,
    userRole: "buyer",
    ...notification,
  });
}

export async function listNotifications(userId: string, userRole: NotificationRole) {
  return prisma.notification.findMany({
    where: { userId, userRole },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string, userId: string, userRole: NotificationRole) {
  return prisma.notification.updateMany({
    where: { id, userId, userRole },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string, userRole: NotificationRole) {
  return prisma.notification.updateMany({
    where: { userId, userRole, read: false },
    data: { read: true },
  });
}

export async function unreadCount(userId: string, userRole: NotificationRole) {
  return prisma.notification.count({
    where: { userId, userRole, read: false },
  });
}
