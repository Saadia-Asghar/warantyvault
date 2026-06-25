import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadCount,
  type NotificationRole,
} from "@/lib/notifications";

function sessionRole(session: { role: string; sub: string } | null) {
  if (!session) return null;
  if (["shop", "buyer", "company"].includes(session.role)) {
    return { userId: session.sub, userRole: session.role as NotificationRole };
  }
  return null;
}

export async function GET() {
  try {
    const session = await getSession();
    const ctx = sessionRole(session);
    if (!ctx) return jsonError("Unauthorized", 401);

    const [notifications, unread] = await Promise.all([
      listNotifications(ctx.userId, ctx.userRole),
      unreadCount(ctx.userId, ctx.userRole),
    ]);

    return jsonOk({ notifications, unread });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const ctx = sessionRole(session);
    if (!ctx) return jsonError("Unauthorized", 401);

    const body = await req.json();
    if (body.markAll) {
      await markAllNotificationsRead(ctx.userId, ctx.userRole);
      return jsonOk({ success: true });
    }

    if (!body.id) return jsonError("Notification id required", 400);
    await markNotificationRead(body.id, ctx.userId, ctx.userRole);
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
