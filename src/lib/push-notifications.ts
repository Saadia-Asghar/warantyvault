import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import type { NotificationRole } from "@/lib/notifications";
import { appBaseUrl } from "@/lib/sms";

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? `mailto:${process.env.ADMIN_EMAIL ?? "admin@warrantyvault.pk"}`;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendPushToUser(input: {
  userId: string;
  userRole: NotificationRole;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  if (!configureVapid()) return;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: input.userId, userRole: input.userRole },
  });

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.linkUrl ? `${appBaseUrl()}${input.linkUrl}` : appBaseUrl(),
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    })
  );
}
