import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

export async function canAccessThread(
  session: SessionPayload,
  thread: { buyerId: string; shopId: string }
): Promise<boolean> {
  if (session.role === "buyer" && session.sub === thread.buyerId) return true;
  if (session.role === "shop" && session.sub === thread.shopId) return true;
  if (session.role === "admin") return true;
  return false;
}

export async function listThreadsForUser(session: SessionPayload) {
  if (session.role === "buyer") {
    return prisma.supportThread.findMany({
      where: { buyerId: session.sub },
      orderBy: { lastMessageAt: "desc" },
      include: {
        shop: { select: { shopName: true, city: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
      },
    });
  }
  if (session.role === "shop") {
    return prisma.supportThread.findMany({
      where: { shopId: session.sub },
      orderBy: { lastMessageAt: "desc" },
      include: {
        buyer: { select: { name: true, phone: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
      },
    });
  }
  return [];
}

export async function getThreadMessages(threadId: string, session: SessionPayload) {
  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
    include: {
      shop: { select: { shopName: true, city: true, phone: true } },
      buyer: { select: { name: true, phone: true } },
      warranty: { select: { warrantyCode: true, productName: true } },
    },
  });
  if (!thread || !(await canAccessThread(session, thread))) return null;

  await prisma.supportMessage.updateMany({
    where: {
      threadId,
      read: false,
      NOT: { senderId: session.sub },
    },
    data: { read: true },
  });

  const messages = await prisma.supportMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return { thread, messages };
}

export async function createThread(input: {
  buyerId: string;
  shopId: string;
  warrantyId?: string;
  subject: string;
  message: string;
}) {
  const shop = await prisma.shop.findFirst({
    where: { id: input.shopId, approvalStatus: "APPROVED" },
  });
  if (!shop) throw new Error("Shop not found or not approved");

  const thread = await prisma.supportThread.create({
    data: {
      buyerId: input.buyerId,
      shopId: input.shopId,
      warrantyId: input.warrantyId,
      subject: input.subject,
      messages: {
        create: {
          senderId: input.buyerId,
          senderRole: "buyer",
          body: input.message,
        },
      },
    },
    include: { shop: { select: { shopName: true } } },
  });

  await notifyUser({
    userId: shop.id,
    userRole: "shop",
    title: "New customer message",
    body: `${input.subject}: ${input.message.slice(0, 80)}`,
    type: "SUPPORT_THREAD",
    linkUrl: `/shop/messages/${thread.id}`,
    email: shop.email,
  });

  return thread;
}

export async function sendThreadMessage(input: {
  threadId: string;
  senderId: string;
  senderRole: "buyer" | "shop";
  body: string;
}) {
  const thread = await prisma.supportThread.findUnique({
    where: { id: input.threadId },
    include: {
      shop: { select: { id: true, email: true, shopName: true } },
      buyer: { select: { id: true, email: true, name: true } },
    },
  });
  if (!thread || thread.status !== "OPEN") throw new Error("Thread not found or closed");

  const message = await prisma.supportMessage.create({
    data: {
      threadId: input.threadId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      body: input.body,
    },
  });

  await prisma.supportThread.update({
    where: { id: input.threadId },
    data: { lastMessageAt: new Date() },
  });

  if (input.senderRole === "buyer") {
    await notifyUser({
      userId: thread.shop.id,
      userRole: "shop",
      title: "Customer replied",
      body: input.body.slice(0, 100),
      type: "SUPPORT_REPLY",
      linkUrl: `/shop/messages/${thread.id}`,
      email: thread.shop.email,
    });
  } else {
    await notifyUser({
      userId: thread.buyer.id,
      userRole: "buyer",
      title: `${thread.shop.shopName} replied`,
      body: input.body.slice(0, 100),
      type: "SUPPORT_REPLY",
      linkUrl: `/buyer/messages/${thread.id}`,
      email: thread.buyer.email,
    });
  }

  return message;
}
