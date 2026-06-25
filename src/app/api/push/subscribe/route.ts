import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return jsonError("Unauthorized", 401);
    }

    const body = schema.parse(await req.json());

    await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        userId: session.sub,
        userRole: session.role,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      update: {
        userId: session.sub,
        userRole: session.role,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
    });

    return jsonOk({ subscribed: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const endpoint = req.nextUrl.searchParams.get("endpoint");
    if (!endpoint) return jsonError("endpoint required", 400);

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: session.sub, userRole: session.role },
    });

    return jsonOk({ unsubscribed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
