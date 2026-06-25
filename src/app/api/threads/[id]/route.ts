import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api";
import { sendMessageSchema } from "@/lib/validators";
import {
  canAccessThread,
  getThreadMessages,
  sendThreadMessage,
} from "@/lib/thread-service";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await getThreadMessages(params.id, session);
    if (!data) {
      return Response.json({ success: false, error: "Thread not found" }, { status: 404 });
    }

    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`thread-msg:${ip}`, 60, 60_000)) {
      return Response.json({ success: false, error: "Too many messages" }, { status: 429 });
    }

    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const thread = await prisma.supportThread.findUnique({ where: { id: params.id } });
    if (!thread || !(await canAccessThread(session, thread))) {
      return Response.json({ success: false, error: "Thread not found" }, { status: 404 });
    }

    const { body } = sendMessageSchema.parse(await req.json());
    const message = await sendThreadMessage({
      threadId: params.id,
      senderId: session.sub,
      senderRole: session.role as "buyer" | "shop",
      body,
    });

    return jsonOk({ message }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const thread = await prisma.supportThread.findUnique({ where: { id: params.id } });
    if (!thread || !(await canAccessThread(session, thread))) {
      return Response.json({ success: false, error: "Thread not found" }, { status: 404 });
    }

    const { status } = (await req.json()) as { status?: string };
    if (status !== "RESOLVED" && status !== "OPEN") {
      return Response.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.supportThread.update({
      where: { id: params.id },
      data: { status },
    });

    return jsonOk({ thread: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
