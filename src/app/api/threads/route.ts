import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api";
import { createThreadSchema } from "@/lib/validators";
import { createThread, listThreadsForUser } from "@/lib/thread-service";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const threads = await listThreadsForUser(session);
    const enriched = await Promise.all(
      threads.map(async (t) => {
        const unread = await prisma.supportMessage.count({
          where: {
            threadId: t.id,
            read: false,
            NOT: { senderId: session!.sub },
          },
        });
        return { t, unread };
      })
    );

    return jsonOk({
      threads: enriched.map(({ t, unread }) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        lastMessageAt: t.lastMessageAt,
        unread,
        preview: t.messages[0]?.body ?? "",
        shopName: "shop" in t && t.shop ? t.shop.shopName : undefined,
        shopCity: "shop" in t && t.shop ? t.shop.city : undefined,
        buyerName: "buyer" in t && t.buyer ? t.buyer.name : undefined,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`thread-create:${ip}`, 20, 60_000)) {
      return Response.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const session = await getSession();
    if (!requireRole(session, "buyer")) {
      return Response.json({ success: false, error: "Buyer login required" }, { status: 401 });
    }

    const body = createThreadSchema.parse(await req.json());
    const thread = await createThread({
      buyerId: session.sub,
      shopId: body.shopId,
      warrantyId: body.warrantyId,
      subject: body.subject,
      message: body.message,
    });

    return jsonOk({ id: thread.id, message: "Message sent to shop" }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Shops buyer can message (from warranties + all approved) */